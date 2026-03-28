import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('EventsModule', () => {
  let service: EventsService;
  let controller: EventsController;
  let prisma: PrismaService;

  const mockPrismaService = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    controller = module.get<EventsController>(EventsController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('EventsService', () => {
    describe('createEvent', () => {
      it('should create a new event', async () => {
        const userId = 'user-123';
        const createEventDto = {
          name: 'Happy Hour',
          description: 'Amazing happy hour',
          date: '2024-02-15',
          startTime: '19:00',
          endTime: '23:00',
          latitude: -23.5505,
          longitude: -46.6333,
          category: 'nightlife',
          isPublic: true,
        };

        const mockEvent = {
          id: 'event-123',
          ...createEventDto,
          organizerId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          organizer: {
            id: userId,
            name: 'John Doe',
            avatar: null,
          },
          _count: {
            attendees: 0,
            reviews: 0,
          },
        };

        jest.spyOn(mockPrismaService.event, 'create').mockResolvedValue(mockEvent);

        const result = await service.createEvent(userId, createEventDto);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('organizerId', userId);
        expect(mockPrismaService.event.create).toHaveBeenCalledTimes(1);
      });

      it('should throw BadRequestException if creation fails', async () => {
        const userId = 'user-123';
        const createEventDto = {
          name: 'Event',
          description: 'Test',
          date: '2024-02-15',
          startTime: '19:00',
          endTime: '23:00',
          latitude: -23.5505,
          longitude: -46.6333,
          category: 'nightlife',
        };

        jest
          .spyOn(mockPrismaService.event, 'create')
          .mockRejectedValue(new Error('Database error'));

        await expect(service.createEvent(userId, createEventDto)).rejects.toThrow(
          'Failed to create event',
        );
      });
    });

    describe('listEvents', () => {
      it('should list all public events', async () => {
        const paginationDto = { page: 1, limit: 10 };
        const mockEvents = [
          {
            id: 'event-1',
            name: 'Event 1',
            organizerId: 'user-1',
            organizer: { id: 'user-1', name: 'User 1', avatar: null },
            _count: { attendees: 5, reviews: 2 },
            deletedAt: null,
          },
        ];

        jest.spyOn(mockPrismaService.event, 'findMany').mockResolvedValue(mockEvents);
        jest.spyOn(mockPrismaService.event, 'count').mockResolvedValue(1);

        const result = await service.listEvents(paginationDto);

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('total', 1);
        expect(result).toHaveProperty('page', 1);
        expect(result).toHaveProperty('limit', 10);
        expect(result.data).toHaveLength(1);
      });

      it('should filter events by location', async () => {
        const paginationDto = { page: 1, limit: 10 };
        const filters = {
          latitude: -23.5505,
          longitude: -46.6333,
          distance: 10,
        };

        jest.spyOn(mockPrismaService.event, 'findMany').mockResolvedValue([]);
        jest.spyOn(mockPrismaService.event, 'count').mockResolvedValue(0);

        await service.listEvents(paginationDto, filters);

        expect(mockPrismaService.event.findMany).toHaveBeenCalled();
        expect(mockPrismaService.event.count).toHaveBeenCalled();
      });
    });

    describe('getEvent', () => {
      it('should return event details', async () => {
        const eventId = 'event-123';
        const mockEvent = {
          id: eventId,
          name: 'Event',
          organizerId: 'user-1',
          organizer: { id: 'user-1', name: 'User 1', avatar: null },
          attendees: [],
          reviews: [],
          _count: { attendees: 0, reviews: 0 },
          deletedAt: null,
        };

        jest.spyOn(mockPrismaService.event, 'findUnique').mockResolvedValue(mockEvent);

        const result = await service.getEvent(eventId);

        expect(result).toHaveProperty('id', eventId);
        expect(result).not.toHaveProperty('deletedAt');
      });

      it('should throw NotFoundException if event not found', async () => {
        jest.spyOn(mockPrismaService.event, 'findUnique').mockResolvedValue(null);

        await expect(service.getEvent('non-existent')).rejects.toThrow(
          'Event not found',
        );
      });

      it('should throw NotFoundException if event is soft deleted', async () => {
        jest.spyOn(mockPrismaService.event, 'findUnique').mockResolvedValue({
          id: 'event-1',
          deletedAt: new Date(),
        });

        await expect(service.getEvent('event-1')).rejects.toThrow(
          'Event not found',
        );
      });
    });

    describe('attendEvent', () => {
      it('should add user as attendee', async () => {
        const eventId = 'event-123';
        const userId = 'user-456';
        const mockEvent = {
          id: eventId,
          maxAttendees: null,
          deletedAt: null,
        };

        jest.spyOn(mockPrismaService.event, 'findUnique').mockResolvedValue(mockEvent);

        const result = await service.attendEvent(eventId, userId);

        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('attendeeCount');
      });

      it('should throw error if already attending', async () => {
        const eventId = 'event-123';
        const userId = 'user-456';
        const mockEvent = {
          id: eventId,
          maxAttendees: null,
          deletedAt: null,
        };

        jest
          .spyOn(mockPrismaService.event, 'findFirst')
          .mockResolvedValue(mockEvent);
        jest.spyOn(mockPrismaService.event, 'findUnique').mockResolvedValue(mockEvent);

        await expect(service.attendEvent(eventId, userId)).rejects.toThrow(
          'Already attending this event',
        );
      });

      it('should throw error if event is full', async () => {
        const eventId = 'event-123';
        const userId = 'user-456';
        const mockEvent = {
          id: eventId,
          maxAttendees: 1,
          deletedAt: null,
        };

        jest.spyOn(mockPrismaService.event, 'findUnique').mockResolvedValue(mockEvent);

        // Mock attendees count
        jest.spyOn(mockPrismaService.event, 'findUnique').mockResolvedValue({
          ...mockEvent,
          attendees: jest.fn().mockResolvedValue([{ id: 'other-user' }]),
        } as any);

        await expect(service.attendEvent(eventId, userId)).rejects.toThrow(
          'Event is full',
        );
      });
    });

    describe('createReview', () => {
      it('should create a review for an event', async () => {
        const eventId = 'event-123';
        const userId = 'user-456';
        const createReviewDto = {
          title: 'Great event!',
          content: 'Really enjoyed it',
          rating: 5,
        };

        const mockEvent = {
          id: eventId,
          deletedAt: null,
        };

        const mockReview = {
          id: 'review-123',
          ...createReviewDto,
          eventId,
          authorId: userId,
          author: {
            id: userId,
            name: 'User',
            avatar: null,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

        jest.spyOn(mockPrismaService.event, 'findUnique').mockResolvedValue(mockEvent);
        jest.spyOn(mockPrismaService.review, 'create').mockResolvedValue(mockReview);
        jest.spyOn(mockPrismaService.review, 'findMany').mockResolvedValue([]);

        const result = await service.createReview(eventId, userId, createReviewDto);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('rating', 5);
        expect(mockPrismaService.review.create).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('EventsController', () => {
    describe('POST /events', () => {
      it('should create an event', async () => {
        const createEventDto = {
          name: 'Event',
          description: 'Test',
          date: '2024-02-15',
          startTime: '19:00',
          endTime: '23:00',
          latitude: -23.5505,
          longitude: -46.6333,
          category: 'nightlife',
        };

        const request = {
          user: { id: 'user-123' },
        };

        jest.spyOn(service, 'createEvent').mockResolvedValue({ id: 'event-1' } as any);

        const result = await controller.createEvent(createEventDto, request);

        expect(result).toHaveProperty('id');
        expect(service.createEvent).toHaveBeenCalledWith('user-123', createEventDto);
      });
    });

    describe('GET /events', () => {
      it('should list events', async () => {
        const paginationDto = { page: 1, limit: 10 };

        jest.spyOn(service, 'listEvents').mockResolvedValue({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        } as any);

        const result = await controller.listEvents(paginationDto);

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('total');
        expect(service.listEvents).toHaveBeenCalledWith(paginationDto, expect.any(Object));
      });
    });

    describe('GET /events/:id', () => {
      it('should return event details', async () => {
        const eventId = 'event-123';

        jest.spyOn(service, 'getEvent').mockResolvedValue({ id: eventId } as any);

        const result = await controller.getEvent(eventId);

        expect(result).toHaveProperty('id', eventId);
        expect(service.getEvent).toHaveBeenCalledWith(eventId);
      });
    });

    describe('POST /events/:id/attend', () => {
      it('should add user to event attendees', async () => {
        const eventId = 'event-123';
        const request = { user: { id: 'user-456' } };

        jest
          .spyOn(service, 'attendEvent')
          .mockResolvedValue({ message: 'Successfully attending event', attendeeCount: 1 } as any);

        const result = await controller.attendEvent(eventId, request);

        expect(result).toHaveProperty('message');
        expect(service.attendEvent).toHaveBeenCalledWith(eventId, 'user-456');
      });
    });

    describe('POST /events/:id/reviews', () => {
      it('should create a review', async () => {
        const eventId = 'event-123';
        const request = { user: { id: 'user-456' } };
        const createReviewDto = {
          title: 'Great!',
          content: 'Loved it',
          rating: 5,
        };

        jest.spyOn(service, 'createReview').mockResolvedValue({ id: 'review-1' } as any);

        const result = await controller.createReview(eventId, createReviewDto, request);

        expect(result).toHaveProperty('id');
        expect(service.createReview).toHaveBeenCalledWith(
          eventId,
          'user-456',
          createReviewDto,
        );
      });
    });
  });
});

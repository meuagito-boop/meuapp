import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { LEGAL_DOCUMENTS, renderLegalDocumentHtml } from './legal-documents';

@ApiExcludeController()
@Controller('legal')
export class LegalController {
  @Get('privacy-policy')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getPrivacyPolicyPage() {
    return renderLegalDocumentHtml(LEGAL_DOCUMENTS.privacyPolicy);
  }

  @Get('terms-of-use')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getTermsOfUsePage() {
    return renderLegalDocumentHtml(LEGAL_DOCUMENTS.termsOfUse);
  }

  @Get('privacy-policy.json')
  getPrivacyPolicyJson() {
    return LEGAL_DOCUMENTS.privacyPolicy;
  }

  @Get('terms-of-use.json')
  getTermsOfUseJson() {
    return LEGAL_DOCUMENTS.termsOfUse;
  }
}

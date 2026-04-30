param(
  [string]$Profile = "meuagito-admin",
  [string]$Region = "",
  [string]$AppName = "meuagito",
  [string]$EnvironmentName = "prod",
  [string]$EcsClusterName = "",
  [string]$EcsServiceName = "",
  [string]$AlbFullName = "",
  [string]$RdsInstanceIdentifier = "",
  [string]$RedisClusterId = "",
  [string]$AlarmTopicArn = "",
  [string]$CloudTrailTrailName = "meuagito-management-trail",
  [string]$CloudTrailS3Bucket = "",
  [int]$LogRetentionDays = 30,
  [string]$LogGroupName = "",
  [switch]$SkipCloudTrail,
  [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-AwsCli {
  param([string[]]$Arguments)

  $commandText = "aws " + ($Arguments -join " ")
  if ($WhatIf) {
    Write-Host $commandText -ForegroundColor Yellow
    return $null
  }

  & aws @Arguments
}

function Ensure-Region {
  if ($Region.Trim().Length -gt 0) {
    return $Region.Trim()
  }

  $resolvedRegion = & aws configure get region --profile $Profile
  if (-not $resolvedRegion -or $resolvedRegion.Trim().Length -eq 0) {
    throw "Nao foi possivel resolver a regiao AWS. Informe -Region explicitamente."
  }

  return $resolvedRegion.Trim()
}

function Ensure-CallerIdentity {
  param([string]$ResolvedRegion)

  Write-Step "Validando sessao AWS"
  Invoke-AwsCli @(
    "sts", "get-caller-identity",
    "--profile", $Profile,
    "--region", $ResolvedRegion,
    "--output", "json"
  ) | Out-Null
}

function Ensure-LogGroup {
  param(
    [string]$ResolvedRegion,
    [string]$ResolvedLogGroupName
  )

  Write-Step "Garantindo log group e retention"

  $existingLogGroup = $null
  if (-not $WhatIf) {
    $raw = Invoke-AwsCli @(
      "logs", "describe-log-groups",
      "--profile", $Profile,
      "--region", $ResolvedRegion,
      "--log-group-name-prefix", $ResolvedLogGroupName,
      "--output", "json"
    )
    $parsed = $raw | ConvertFrom-Json
    $existingLogGroup = $parsed.logGroups | Where-Object { $_.logGroupName -eq $ResolvedLogGroupName } | Select-Object -First 1
  } else {
    Invoke-AwsCli @(
      "logs", "describe-log-groups",
      "--profile", $Profile,
      "--region", $ResolvedRegion,
      "--log-group-name-prefix", $ResolvedLogGroupName,
      "--output", "json"
    ) | Out-Null
  }

  if (-not $existingLogGroup) {
    Invoke-AwsCli @(
      "logs", "create-log-group",
      "--profile", $Profile,
      "--region", $ResolvedRegion,
      "--log-group-name", $ResolvedLogGroupName
    ) | Out-Null
  }

  Invoke-AwsCli @(
    "logs", "put-retention-policy",
    "--profile", $Profile,
    "--region", $ResolvedRegion,
    "--log-group-name", $ResolvedLogGroupName,
    "--retention-in-days", "$LogRetentionDays"
  ) | Out-Null
}

function Put-MetricFilter {
  param(
    [string]$ResolvedRegion,
    [string]$ResolvedLogGroupName,
    [string]$Namespace,
    [string]$FilterName,
    [string]$FilterPattern,
    [string]$MetricName
  )

  Invoke-AwsCli @(
    "logs", "put-metric-filter",
    "--profile", $Profile,
    "--region", $ResolvedRegion,
    "--log-group-name", $ResolvedLogGroupName,
    "--filter-name", $FilterName,
    "--filter-pattern", $FilterPattern,
    "--metric-transformations", "metricName=$MetricName,metricNamespace=$Namespace,metricValue=1,defaultValue=0"
  ) | Out-Null
}

function Put-MetricAlarm {
  param(
    [string]$ResolvedRegion,
    [string]$AlarmName,
    [string]$Namespace,
    [string]$MetricName,
    [string]$Statistic,
    [int]$Period,
    [int]$EvaluationPeriods,
    [double]$Threshold,
    [string]$ComparisonOperator,
    [string[]]$Dimensions = @()
  )

  $arguments = @(
    "cloudwatch", "put-metric-alarm",
    "--profile", $Profile,
    "--region", $ResolvedRegion,
    "--alarm-name", $AlarmName,
    "--namespace", $Namespace,
    "--metric-name", $MetricName,
    "--statistic", $Statistic,
    "--period", "$Period",
    "--evaluation-periods", "$EvaluationPeriods",
    "--threshold", "$Threshold",
    "--comparison-operator", $ComparisonOperator,
    "--treat-missing-data", "notBreaching"
  )

  if ($Dimensions.Count -gt 0) {
    $arguments += "--dimensions"
    $arguments += $Dimensions
  }

  if ($AlarmTopicArn.Trim().Length -gt 0) {
    $arguments += "--alarm-actions"
    $arguments += $AlarmTopicArn
  }

  Invoke-AwsCli $arguments | Out-Null
}

function Put-Dashboard {
  param(
    [string]$ResolvedRegion,
    [string]$Namespace,
    [string]$ResolvedLogGroupName
  )

  Write-Step "Publicando dashboard CloudWatch"

  $widgets = @(
    @{
      type = "metric"
      x = 0
      y = 0
      width = 12
      height = 6
      properties = @{
        title = "Application failures"
        region = $ResolvedRegion
        view = "timeSeries"
        stacked = $false
        stat = "Sum"
        period = 300
        metrics = @(
          @($Namespace, "HttpErrors"),
          @(".", "EmailSendFailures"),
          @(".", "PushDeliveryFailures")
        )
      }
    },
    @{
      type = "text"
      x = 12
      y = 0
      width = 12
      height = 3
      properties = @{
        markdown = "## Meu Agito observability`n`nLog group: $ResolvedLogGroupName`nNamespace: $Namespace"
      }
    }
  )

  if ($EcsClusterName.Trim().Length -gt 0 -and $EcsServiceName.Trim().Length -gt 0) {
    $widgets += @{
      type = "metric"
      x = 0
      y = 6
      width = 12
      height = 6
      properties = @{
        title = "ECS service health"
        region = $ResolvedRegion
        view = "timeSeries"
        stacked = $false
        metrics = @(
          @("AWS/ECS", "CPUUtilization", "ClusterName", $EcsClusterName, "ServiceName", $EcsServiceName),
          @(".", "MemoryUtilization", ".", ".", ".", ".")
        )
      }
    }
  }

  if ($AlbFullName.Trim().Length -gt 0) {
    $widgets += @{
      type = "metric"
      x = 12
      y = 6
      width = 12
      height = 6
      properties = @{
        title = "ALB target health and latency"
        region = $ResolvedRegion
        view = "timeSeries"
        stacked = $false
        metrics = @(
          @("AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", $AlbFullName),
          @(".", "TargetResponseTime", ".", "."),
          @(".", "UnHealthyHostCount", ".", ".")
        )
      }
    }
  }

  $dashboardBody = @{
    widgets = $widgets
  } | ConvertTo-Json -Depth 8 -Compress

  Invoke-AwsCli @(
    "cloudwatch", "put-dashboard",
    "--profile", $Profile,
    "--region", $ResolvedRegion,
    "--dashboard-name", "$AppName-$EnvironmentName-observability",
    "--dashboard-body", $dashboardBody
  ) | Out-Null
}

function Ensure-CloudTrail {
  param([string]$ResolvedRegion)

  if ($SkipCloudTrail) {
    return
  }

  Write-Step "Garantindo CloudTrail de management events"

  $trailExists = $false
  if (-not $WhatIf) {
    $raw = Invoke-AwsCli @(
      "cloudtrail", "describe-trails",
      "--profile", $Profile,
      "--region", $ResolvedRegion,
      "--trail-name-list", $CloudTrailTrailName,
      "--output", "json"
    )
    $parsed = $raw | ConvertFrom-Json
    $trailExists = ($parsed.trailList | Where-Object { $_.Name -eq $CloudTrailTrailName } | Measure-Object).Count -gt 0
  } else {
    Invoke-AwsCli @(
      "cloudtrail", "describe-trails",
      "--profile", $Profile,
      "--region", $ResolvedRegion,
      "--trail-name-list", $CloudTrailTrailName,
      "--output", "json"
    ) | Out-Null
  }

  if (-not $trailExists) {
    if ($CloudTrailS3Bucket.Trim().Length -eq 0) {
      if ($WhatIf) {
        Write-Host "CloudTrail '$CloudTrailTrailName' exigira -CloudTrailS3Bucket para criacao real." -ForegroundColor Yellow
        return
      }

      throw "CloudTrail '$CloudTrailTrailName' nao existe e nenhum bucket foi informado em -CloudTrailS3Bucket."
    }

    Invoke-AwsCli @(
      "cloudtrail", "create-trail",
      "--profile", $Profile,
      "--region", $ResolvedRegion,
      "--name", $CloudTrailTrailName,
      "--s3-bucket-name", $CloudTrailS3Bucket,
      "--is-multi-region-trail",
      "--include-global-service-events",
      "--enable-log-file-validation"
    ) | Out-Null
  }

  Invoke-AwsCli @(
    "cloudtrail", "start-logging",
    "--profile", $Profile,
    "--region", $ResolvedRegion,
    "--name", $CloudTrailTrailName
  ) | Out-Null
}

$ResolvedRegion = Ensure-Region
$ResolvedLogGroupName = $LogGroupName.Trim()
if ($ResolvedLogGroupName.Length -eq 0) {
  $ResolvedLogGroupName = "/aws/ecs/$AppName-$EnvironmentName-backend"
}
$Namespace = "MeuAgito/$EnvironmentName"

Ensure-CallerIdentity -ResolvedRegion $ResolvedRegion
Ensure-LogGroup -ResolvedRegion $ResolvedRegion -ResolvedLogGroupName $ResolvedLogGroupName

Write-Step "Publicando metric filters"
Put-MetricFilter -ResolvedRegion $ResolvedRegion -ResolvedLogGroupName $ResolvedLogGroupName -Namespace $Namespace -FilterName "$AppName-$EnvironmentName-http-errors" -FilterPattern '{ $.event = "http.request.failed" || $.event = "http.exception" }' -MetricName "HttpErrors"
Put-MetricFilter -ResolvedRegion $ResolvedRegion -ResolvedLogGroupName $ResolvedLogGroupName -Namespace $Namespace -FilterName "$AppName-$EnvironmentName-email-send-failures" -FilterPattern '{ $.event = "email.send.failed" }' -MetricName "EmailSendFailures"
Put-MetricFilter -ResolvedRegion $ResolvedRegion -ResolvedLogGroupName $ResolvedLogGroupName -Namespace $Namespace -FilterName "$AppName-$EnvironmentName-push-send-failures" -FilterPattern '{ $.event = "notification.send_to_device.failed" || $.event = "notification.send_to_topic.failed" }' -MetricName "PushDeliveryFailures"

Write-Step "Publicando alarmes"
Put-MetricAlarm -ResolvedRegion $ResolvedRegion -AlarmName "$AppName-$EnvironmentName-http-errors" -Namespace $Namespace -MetricName "HttpErrors" -Statistic "Sum" -Period 300 -EvaluationPeriods 1 -Threshold 1 -ComparisonOperator "GreaterThanOrEqualToThreshold"
Put-MetricAlarm -ResolvedRegion $ResolvedRegion -AlarmName "$AppName-$EnvironmentName-email-send-failures" -Namespace $Namespace -MetricName "EmailSendFailures" -Statistic "Sum" -Period 300 -EvaluationPeriods 1 -Threshold 1 -ComparisonOperator "GreaterThanOrEqualToThreshold"
Put-MetricAlarm -ResolvedRegion $ResolvedRegion -AlarmName "$AppName-$EnvironmentName-push-delivery-failures" -Namespace $Namespace -MetricName "PushDeliveryFailures" -Statistic "Sum" -Period 300 -EvaluationPeriods 1 -Threshold 1 -ComparisonOperator "GreaterThanOrEqualToThreshold"

if ($EcsClusterName.Trim().Length -gt 0 -and $EcsServiceName.Trim().Length -gt 0) {
  Put-MetricAlarm -ResolvedRegion $ResolvedRegion -AlarmName "$AppName-$EnvironmentName-ecs-cpu-high" -Namespace "AWS/ECS" -MetricName "CPUUtilization" -Statistic "Average" -Period 300 -EvaluationPeriods 3 -Threshold 80 -ComparisonOperator "GreaterThanThreshold" -Dimensions @("Name=ClusterName,Value=$EcsClusterName", "Name=ServiceName,Value=$EcsServiceName")
  Put-MetricAlarm -ResolvedRegion $ResolvedRegion -AlarmName "$AppName-$EnvironmentName-ecs-memory-high" -Namespace "AWS/ECS" -MetricName "MemoryUtilization" -Statistic "Average" -Period 300 -EvaluationPeriods 3 -Threshold 80 -ComparisonOperator "GreaterThanThreshold" -Dimensions @("Name=ClusterName,Value=$EcsClusterName", "Name=ServiceName,Value=$EcsServiceName")
}

if ($AlbFullName.Trim().Length -gt 0) {
  Put-MetricAlarm -ResolvedRegion $ResolvedRegion -AlarmName "$AppName-$EnvironmentName-alb-5xx" -Namespace "AWS/ApplicationELB" -MetricName "HTTPCode_Target_5XX_Count" -Statistic "Sum" -Period 300 -EvaluationPeriods 1 -Threshold 5 -ComparisonOperator "GreaterThanOrEqualToThreshold" -Dimensions @("Name=LoadBalancer,Value=$AlbFullName")
  Put-MetricAlarm -ResolvedRegion $ResolvedRegion -AlarmName "$AppName-$EnvironmentName-alb-unhealthy-targets" -Namespace "AWS/ApplicationELB" -MetricName "UnHealthyHostCount" -Statistic "Average" -Period 300 -EvaluationPeriods 1 -Threshold 1 -ComparisonOperator "GreaterThanOrEqualToThreshold" -Dimensions @("Name=LoadBalancer,Value=$AlbFullName")
}

if ($RdsInstanceIdentifier.Trim().Length -gt 0) {
  Put-MetricAlarm -ResolvedRegion $ResolvedRegion -AlarmName "$AppName-$EnvironmentName-rds-cpu-high" -Namespace "AWS/RDS" -MetricName "CPUUtilization" -Statistic "Average" -Period 300 -EvaluationPeriods 3 -Threshold 80 -ComparisonOperator "GreaterThanThreshold" -Dimensions @("Name=DBInstanceIdentifier,Value=$RdsInstanceIdentifier")
  Put-MetricAlarm -ResolvedRegion $ResolvedRegion -AlarmName "$AppName-$EnvironmentName-rds-free-storage-low" -Namespace "AWS/RDS" -MetricName "FreeStorageSpace" -Statistic "Average" -Period 300 -EvaluationPeriods 3 -Threshold 21474836480 -ComparisonOperator "LessThanThreshold" -Dimensions @("Name=DBInstanceIdentifier,Value=$RdsInstanceIdentifier")
}

if ($RedisClusterId.Trim().Length -gt 0) {
  Put-MetricAlarm -ResolvedRegion $ResolvedRegion -AlarmName "$AppName-$EnvironmentName-redis-cpu-high" -Namespace "AWS/ElastiCache" -MetricName "CPUUtilization" -Statistic "Average" -Period 300 -EvaluationPeriods 3 -Threshold 80 -ComparisonOperator "GreaterThanThreshold" -Dimensions @("Name=CacheClusterId,Value=$RedisClusterId")
}

Put-Dashboard -ResolvedRegion $ResolvedRegion -Namespace $Namespace -ResolvedLogGroupName $ResolvedLogGroupName
Ensure-CloudTrail -ResolvedRegion $ResolvedRegion

Write-Step "Observability AWS alinhada"
Write-Host "Log group: $ResolvedLogGroupName"
Write-Host "Namespace: $Namespace"
Write-Host "CloudTrail: $CloudTrailTrailName"

export type DeployEnv = 'local' | 'staging' | 'production';

export const DEPLOY_ENV_VALUES: DeployEnv[] = ['local', 'staging', 'production'];

export function resolveDeployEnv(nodeEnv?: string, deployEnv?: string): string {
  const normalizedDeployEnv = deployEnv?.trim().toLowerCase();
  if (normalizedDeployEnv) {
    return normalizedDeployEnv;
  }

  return nodeEnv?.trim() === 'production' ? 'production' : 'local';
}

export function isValidDeployEnv(deployEnv: string): deployEnv is DeployEnv {
  return DEPLOY_ENV_VALUES.includes(deployEnv as DeployEnv);
}

export function isProductionDeployment(nodeEnv?: string, deployEnv?: string): boolean {
  return resolveDeployEnv(nodeEnv, deployEnv) === 'production';
}

export function isManagedDeployment(nodeEnv?: string, deployEnv?: string): boolean {
  const resolvedDeployEnv = resolveDeployEnv(nodeEnv, deployEnv);
  return resolvedDeployEnv === 'staging' || resolvedDeployEnv === 'production';
}

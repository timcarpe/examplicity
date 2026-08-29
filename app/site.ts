const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (deploymentHost ? `https://${deploymentHost}` : 'https://www.examplicity.org');

export const siteTitle = 'Examplicity — Make complex ideas click';
export const siteDescription = 'Interactive GCSE, AS and A Level resources for exam practice and visual concept explanations.';

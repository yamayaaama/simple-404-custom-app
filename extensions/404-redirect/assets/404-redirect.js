console.log('404 Redirect Extension');

function is404Page() {
  return document.title.includes('404') ||
         window.location.pathname.includes('/404') ||
         document.body.textContent.includes('Page Not Found');
}

async function getRedirectSettings() {
  try {
    const response = await fetch('/apps/404redirect/settings');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch redirect settings:', error);
    return null;
  }
}

async function handle404Redirect() {
  if (!is404Page()) {
    return;
  }

  console.log('404 page detected, checking redirect settings...');

  const settings = await getRedirectSettings();

  if (settings && settings.isEnabled && settings.redirectUrl) {
    console.log('Redirect to:', settings.redirectUrl);
    window.location.href = settings.redirectUrl;
  } else {
    console.log('No redirect configured or disabled');
  }
}

document.addEventListener('DOMContentLoaded', handle404Redirect);
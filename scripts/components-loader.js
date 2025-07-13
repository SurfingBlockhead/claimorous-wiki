/**
 * Template Loader for Claimorous Wiki
 * This script loads common elements (sidebar, header, footer) from template files
 * to ensure consistent structure across all pages.
 */

document.addEventListener('DOMContentLoaded', function() {
    consoleLogging('Template loader initialized');
    
    // Get the base URL for component loading
    const baseUrl = getBaseUrl();
    consoleLogging('Base URL for components:', baseUrl);
    
    // Define component paths
    const sidebarPath = baseUrl + 'components/sidebar.html';
    const navbarPath = baseUrl + 'components/navbar.html';
    const footerPath = baseUrl + 'components/footer.html';
    const backToTopPath = baseUrl + 'components/back-on-top.html';
    
    // Load sidebar
    consoleLogging('Loading sidebar from:', sidebarPath);
    loadComponent('sidebar', sidebarPath, function() {
        consoleLogging('Sidebar loaded successfully');
        // Fix sidebar links to work from any page
        fixSidebarLinks();
        // Dispatch event for main.js to initialize sidebar functionality
        document.dispatchEvent(new Event('sidebarLoaded'));
    });
    
    // Load header (navbar)
    consoleLogging('Loading navbar from:', navbarPath);
    loadComponent('navbar', navbarPath, function() {
        consoleLogging('Navbar loaded successfully');
        // Dispatch event for main.js to initialize navbar functionality
        document.dispatchEvent(new Event('navbarLoaded'));
    });
    
    // Load back to top button
    consoleLogging('Loading back to top button from:', backToTopPath);
    loadComponent('back-to-top', backToTopPath, function() {
        consoleLogging('Back to top button loaded successfully');
    });

    // Load footer
    consoleLogging('Loading footer from:', footerPath);
    loadComponent('footer', footerPath, function() {
        consoleLogging('Footer loaded successfully');
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            const currentYear = new Date().getFullYear();
            yearSpan.textContent = currentYear;
        }
    });
});

/**
 * Load a component from a template file and insert it into the page
 * @param {string} elementId - The ID of the element to replace with the template
 * @param {string} templateUrl - The URL of the template file
 * @param {function} callback - Optional callback function to run after loading
 */
function loadComponent(elementId, templateUrl, callback) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID '${elementId}' not found`);
        return;
    }
    
    const fallbackMessage = `<div class="alert alert-danger">Failed to load ${elementId}. Please check your connection.</div>`;
    
    fetch(templateUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            if (!html || html.trim() === '') {
                console.error(`Empty content received for '${elementId}'`);
                element.innerHTML = fallbackMessage;
                return;
            }
            
            element.innerHTML = html;
            
            if (callback && typeof callback === 'function') {
                callback();
            }
        })
        .catch(error => {
            console.error(`Error loading template for '${elementId}':`, error);
            element.innerHTML = fallbackMessage;
        });
}

/**
* Get the base URL for loading components
* This handles local file access, web server environments, and GitHub Pages
* @returns {string} The base URL path to use for loading components
*/
function getBaseUrl() {
   const isLocalFile = window.location.protocol === 'file:';
   const pathname = window.location.pathname.replace(/\\/g, '/');
   
   if (isLocalFile) {
       // For local file system access
       consoleLogging('Local file path:', pathname);
       
       // Count directory levels from root to determine relative path
       const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
       const filename = pathSegments[pathSegments.length - 1];
       
       // If we're at root level (index.html or similar)
       if (pathSegments.length <= 1 || (pathSegments.length === 2 && filename.includes('.html'))) {
           return './';
       }
       
       // For pages in subdirectories, calculate the correct relative path
       // Each directory level needs one "../" to go back to root
       const directoryDepth = pathSegments.length - 1; // -1 for the filename itself
       return '../'.repeat(directoryDepth);
   } else {
       // For web server (including GitHub Pages)
       const hostname = window.location.hostname;
       if (hostname.includes('github.io')) {
           const pathParts = pathname.split('/').filter(part => part.length > 0);
           
           if (pathParts.length > 0) {
               const repoName = pathParts[0];
               return `/${repoName}/`;
           }
           
           // Fallback for GitHub Pages
           return '/';
       } else {
           // For regular web server, use root path
           return '/';
       }
   }
}

/**
 * Fix sidebar links to ensure they work correctly from any page
 * This function adjusts all links in the sidebar to use the correct relative paths
 * based on the current page location
 */
function fixSidebarLinks() {
    const baseUrl = getBaseUrl();
    consoleLogging('Fixing sidebar links with base URL:', baseUrl);
    
    // Get all links in the sidebar
    const sidebarLinks = document.querySelectorAll('#sidebar a');
    
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Skip external links and anchor links
        if (!href || href.startsWith('http') || href.startsWith('#') || href.includes('mailto:')) {
            return;
        }
        
        // Fix links that point to index.html or views/
        if (href === 'index.html') {
            // If we're on GitHub Pages
            if (window.location.hostname.includes('github.io')) {
                const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
                if (pathParts.length > 0) {
                    const repoName = pathParts[0];
                    link.setAttribute('href', `/${repoName}/index.html`);
                }
            } else if (window.location.protocol !== 'file:') {
                // For regular web server
                link.setAttribute('href', '/index.html');
            } else {
                // For local file access, calculate the correct relative path
                const newHref = baseUrl + 'index.html';
                link.setAttribute('href', newHref);
            }
        } else if (href.startsWith('views/')) {
            // If we're on GitHub Pages
            if (window.location.hostname.includes('github.io')) {
                const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
                if (pathParts.length > 0) {
                    const repoName = pathParts[0];
                    link.setAttribute('href', `/${repoName}/${href}`);
                }
            } else if (window.location.protocol !== 'file:') {
                // For regular web server
                link.setAttribute('href', `/${href}`);
            } else {
                // For local file access, calculate the correct relative path
                const newHref = baseUrl + href;
                link.setAttribute('href', newHref);
            }
        }
    });
    
    consoleLogging('Sidebar links fixed successfully');
}
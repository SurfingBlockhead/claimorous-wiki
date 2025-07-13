// ReadTheDocs-style JavaScript for Claimorous! Wiki

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    consoleLogging('Main script initialized');
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize code blocks with copy buttons
    initializeCodeBlocks();
    
    // Initialize syntax highlighting if highlight.js is available
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
});

// Track component loading status
let sidebarLoaded = false;
let navbarLoaded = false;

// Initialize sidebar functionality when sidebar is loaded
document.addEventListener('sidebarLoaded', function() {
    consoleLogging('Sidebar loaded event received');
    sidebarLoaded = true;
    
    // Initialize components if both sidebar and navbar are loaded
    if (sidebarLoaded && navbarLoaded) {
        initializeUIComponents();
    }
});

// Initialize navbar functionality when navbar is loaded
document.addEventListener('navbarLoaded', function() {
    consoleLogging('Navbar loaded event received');
    navbarLoaded = true;
    
    // Initialize components if both sidebar and navbar are loaded
    if (sidebarLoaded && navbarLoaded) {
        initializeUIComponents();
    }
});

/**
 * Initialize all UI components after both sidebar and navbar are loaded
 */
function initializeUIComponents() {
    consoleLogging('Both sidebar and navbar loaded, initializing UI components');
    
    // Initialize sidebar toggle
    initializeSidebarToggle();
    
    // Initialize dropdown toggles
    initializeDropdownToggles();
    
    // Highlight active page in sidebar
    highlightCurrentPage();
}

/**
 * Initialize sidebar toggle functionality
 */
function initializeSidebarToggle() {
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    
    if (!sidebarCollapse || !sidebar || !content) {
        console.error('Sidebar elements not found');
        return;
    }
    
    consoleLogging('Setting up sidebar toggle button');
    
    // Remove any existing event listeners by cloning and replacing the button
    const newButton = sidebarCollapse.cloneNode(true);
    sidebarCollapse.parentNode.replaceChild(newButton, sidebarCollapse);
    
    // Add the click handler to the new button
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        consoleLogging('Sidebar toggle clicked');
        sidebar.classList.toggle('active');
        content.classList.toggle('active');
    });
}

/**
 * Initialize dropdown toggle functionality
 */
function initializeDropdownToggles() {
    consoleLogging('Initializing dropdown toggles');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    if (!dropdownToggles.length) {
        console.error('No dropdown toggles found');
        return;
    }
    
    // First ensure all dropdowns are closed by default
    document.querySelectorAll('.collapse').forEach(function(collapse) {
        collapse.classList.remove('show');
    });
    
    // Clear any existing click handlers by cloning and replacing each toggle
    dropdownToggles.forEach(function(toggle) {
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);
        
        // Add click event listener to the new toggle
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target from the href
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (!targetElement) {
                console.error(`Target element ${targetId} not found`);
                return false;
            }
            
            // Close all other dropdowns
            document.querySelectorAll('.collapse.show').forEach(function(openDropdown) {
                if (openDropdown.id !== targetElement.id) {
                    openDropdown.classList.remove('show');
                    
                    // Update aria-expanded for the corresponding toggle
                    const otherToggle = document.querySelector(`a[href="#${openDropdown.id}"]`);
                    if (otherToggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            
            // Toggle the current dropdown
            targetElement.classList.toggle('show');
            
            // Update aria-expanded attribute
            const isExpanded = targetElement.classList.contains('show');
            this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            
            consoleLogging(`Toggled dropdown ${targetId} - now ${isExpanded ? 'open' : 'closed'}`);
            
            return false;
        });
    });
}

/**
 * Highlight the current page in the sidebar navigation
 */
function highlightCurrentPage() {
    consoleLogging('Highlighting current page');
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    
    if (!sidebarLinks.length) {
        console.error('No sidebar links found');
        return;
    }
    
    // Find the active link
    let activeLink = null;
    
    sidebarLinks.forEach(function(link) {
        const linkPath = link.getAttribute('href');
        
        if (!linkPath) return;
        
        // Check if the current path matches the link path
        // Handle both absolute and relative paths
        const linkPathClean = linkPath.startsWith('/') ? linkPath : '/' + linkPath;
        const currentPathClean = currentPath.endsWith('/') ? currentPath + 'index.html' : currentPath;
        
        if (currentPathClean.endsWith(linkPathClean) || 
            (linkPath === '/index.html' && (currentPath === '/' || currentPath.endsWith('/index.html')))) {
            activeLink = link;
        }
    });
    
    // If we found an active link
    if (activeLink) {
        consoleLogging('Active link found:', activeLink.getAttribute('href'));
        
        // Remove active class from all links
        sidebarLinks.forEach(link => {
            if (link.parentElement) {
                link.parentElement.classList.remove('active');
            }
        });
        
        // Add active class to current link
        activeLink.parentElement.classList.add('active');
        
        // If it's in a dropdown, expand the dropdown
        const parentCollapse = activeLink.closest('.collapse');
        if (parentCollapse) {
            parentCollapse.classList.add('show');
            
            // Update the dropdown toggle
            const toggle = document.querySelector(`a[href="#${parentCollapse.id}"]`);
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'true');
            }
        }
    } else {
        consoleLogging('No active link found for path:', currentPath);
    }
}

/**
 * Initialize code blocks with copy functionality
 */
function initializeCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(function(codeBlock) {
        const pre = codeBlock.parentNode;
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        
        // Add click event to copy code
        copyButton.addEventListener('click', function() {
            const code = codeBlock.textContent;
            navigator.clipboard.writeText(code).then(function() {
                copyButton.textContent = 'Copied!';
                setTimeout(function() {
                    copyButton.textContent = 'Copy';
                }, 2000);
            });
        });
        
        // Wrap the pre in the wrapper and add the button
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(copyButton);
    });
}

/**
 * Initialize search functionality for the sidebar
 */
function initializeSearch() {
    // Wait for the search input to be available (after sidebar is loaded)
    document.addEventListener('sidebarLoaded', function() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) {
            console.error('Search input not found');
            return;
        }
        
        consoleLogging('Setting up search input handler');
        
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    // Determine the path to search.html based on current location
                    let searchPath;
                    
                    // Get base URL from the base tag if it exists
                    const baseTag = document.querySelector('base');
                    const baseHref = baseTag ? baseTag.getAttribute('href') : '';
                    
                    if (window.location.protocol === 'file:') {
                        // For local file system
                        if (window.location.pathname.includes('/views/')) {
                            searchPath = '../views/search.html';
                        } else {
                            searchPath = './views/search.html';
                        }
                    } else if (baseHref) {
                        // If we have a base tag (GitHub Pages), use it
                        searchPath = baseHref + 'views/search.html';
                    } else {
                        // Default for web server
                        searchPath = '/views/search.html';
                    }
                    
                    window.location.href = searchPath + '?q=' + encodeURIComponent(query);
                }
            }
        });
    });
    
    consoleLogging('Search functionality initialized');
}

// Smooth scroll to top function
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

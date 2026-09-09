/**
 * Search and filter system for commands
 */

export class CommandFilter {
  constructor(commands) {
    this.allCommands = commands;
    this.filteredCommands = commands;
    this.filters = {
      shell: [],
      category: [],
      riskLevel: [],
      adminRequired: null,
      searchTerm: '',
    };
  }

  /**
   * Filter by shell type
   */
  setShellFilter(shells) {
    this.filters.shell = Array.isArray(shells) ? shells : [];
    this.applyFilters();
  }

  /**
   * Filter by category
   */
  setCategoryFilter(categories) {
    this.filters.category = Array.isArray(categories) ? categories : [];
    this.applyFilters();
  }

  /**
   * Filter by risk level (readonly, modifies_system, destructive)
   */
  setRiskFilter(risks) {
    this.filters.riskLevel = Array.isArray(risks) ? risks : [];
    this.applyFilters();
  }

  /**
   * Filter for admin-required commands only
   */
  setAdminFilter(adminOnly) {
    this.filters.adminRequired = adminOnly ? true : null;
    this.applyFilters();
  }

  /**
   * Full-text search across name, description, parameters, use cases
   */
  setSearchTerm(term) {
    this.filters.searchTerm = term.toLowerCase().trim();
    this.applyFilters();
  }

  /**
   * Apply all active filters
   */
  applyFilters() {
    let result = this.allCommands;

    // Shell filter
    if (this.filters.shell.length > 0) {
      result = result.filter(cmd => this.filters.shell.includes(cmd.shell));
    }

    // Category filter
    if (this.filters.category.length > 0) {
      result = result.filter(cmd => this.filters.category.includes(cmd.category));
    }

    // Risk level filter
    if (this.filters.riskLevel.length > 0) {
      result = result.filter(cmd => this.filters.riskLevel.includes(cmd.risk));
    }

    // Admin filter
    if (this.filters.adminRequired !== null) {
      result = result.filter(cmd => cmd.adminRequired === this.filters.adminRequired);
    }

    // Search term
    if (this.filters.searchTerm) {
      result = result.filter(cmd => this.matchesSearch(cmd, this.filters.searchTerm));
    }

    this.filteredCommands = result;
    return result;
  }

  /**
   * Check if command matches search term
   */
  matchesSearch(cmd, term) {
    const searchFields = [
      cmd.name,
      cmd.description,
      cmd.syntax,
      cmd.useCases || '',
      cmd.category,
      ...(cmd.parameters ? cmd.parameters.map(p => `${p.param} ${p.desc}`) : []),
      ...(cmd.examples ? cmd.examples : []),
      ...(cmd.relatedCommands ? cmd.relatedCommands : []),
    ];

    return searchFields.some(field => 
      field && field.toLowerCase().includes(term)
    );
  }

  /**
   * Get filtered results
   */
  getFiltered() {
    return this.filteredCommands;
  }

  /**
   * Reset all filters
   */
  reset() {
    this.filters = {
      shell: [],
      category: [],
      riskLevel: [],
      adminRequired: null,
      searchTerm: '',
    };
    this.filteredCommands = this.allCommands;
    return this.allCommands;
  }

  /**
   * Get available categories from all commands
   */
  getCategories() {
    const categories = new Set(this.allCommands.map(cmd => cmd.category));
    return Array.from(categories).sort();
  }

  /**
   * Get available shells from all commands
   */
  getShells() {
    const shells = new Set(this.allCommands.map(cmd => cmd.shell));
    return Array.from(shells).sort();
  }
}

/**
 * UI controller for search/filter toolbar
 */
export class FilterUIController {
  constructor(filterer, containerSelector) {
    this.filterer = filterer;
    this.container = document.querySelector(containerSelector);
    this.resultCallback = null;
  }

  /**
   * Render filter toolbar
   */
  render() {
    const shells = this.filterer.getShells();
    const categories = this.filterer.getCategories();

    const shellOptions = shells.map(s => `
      <label class="filter-checkbox">
        <input type="checkbox" data-filter-type="shell" data-filter-value="${s}">
        <span>${s}</span>
      </label>
    `).join('');

    const categoryOptions = categories.map(c => `
      <label class="filter-checkbox">
        <input type="checkbox" data-filter-type="category" data-filter-value="${c}">
        <span>${c}</span>
      </label>
    `).join('');

    const html = `
      <div class="filter-toolbar">
        <div class="search-box">
          <input type="text" 
                 id="search-input" 
                 class="search-input" 
                 placeholder="Search commands, parameters, use cases..."
                 aria-label="Search commands">
          <button id="clear-search" class="clear-search-btn" aria-label="Clear search" style="display: none;">✕</button>
        </div>

        <div class="filter-groups">
          <details class="filter-group">
            <summary>Shell</summary>
            <div class="filter-options">
              ${shellOptions}
            </div>
          </details>

          <details class="filter-group">
            <summary>Category</summary>
            <div class="filter-options">
              ${categoryOptions}
            </div>
          </details>

          <details class="filter-group">
            <summary>Type</summary>
            <div class="filter-options">
              <label class="filter-checkbox">
                <input type="checkbox" data-filter-type="risk" data-filter-value="readonly">
                <span>Read-only</span>
              </label>
              <label class="filter-checkbox">
                <input type="checkbox" data-filter-type="risk" data-filter-value="modifies_system">
                <span>Modifies System</span>
              </label>
              <label class="filter-checkbox">
                <input type="checkbox" data-filter-type="risk" data-filter-value="destructive">
                <span>Destructive</span>
              </label>
            </div>
          </details>

          <details class="filter-group">
            <summary>Admin</summary>
            <div class="filter-options">
              <label class="filter-checkbox">
                <input type="checkbox" id="admin-filter" data-filter-type="admin">
                <span>Admin Required Only</span>
              </label>
            </div>
          </details>
        </div>

        <div class="filter-reset">
          <button id="reset-filters" class="reset-btn">Reset Filters</button>
        </div>

        <div class="filter-results">
          <span id="result-count" class="result-count"></span>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const resetBtn = document.getElementById('reset-filters');
    const adminFilter = document.getElementById('admin-filter');

    // Search
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value;
      this.filterer.setSearchTerm(term);
      clearSearchBtn.style.display = term ? 'block' : 'none';
      this.updateResults();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      this.filterer.setSearchTerm('');
      this.updateResults();
    });

    // Checkboxes for shell, category, risk
    document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const filterType = e.target.dataset.filterType;
        const filterValue = e.target.dataset.filterValue;

        const checked = Array.from(
          document.querySelectorAll(`.filter-checkbox input[data-filter-type="${filterType}"]:checked`)
        ).map(c => c.dataset.filterValue);

        if (filterType === 'shell') {
          this.filterer.setShellFilter(checked);
        } else if (filterType === 'category') {
          this.filterer.setCategoryFilter(checked);
        } else if (filterType === 'risk') {
          this.filterer.setRiskFilter(checked);
        }

        this.updateResults();
      });
    });

    // Admin filter
    adminFilter.addEventListener('change', (e) => {
      this.filterer.setAdminFilter(e.target.checked);
      this.updateResults();
    });

    // Reset
    resetBtn.addEventListener('click', () => {
      this.filterer.reset();
      document.querySelectorAll('.filter-checkbox input').forEach(c => c.checked = false);
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      this.updateResults();
    });
  }

  /**
   * Update results display
   */
  updateResults() {
    const results = this.filterer.getFiltered();
    const resultCount = document.getElementById('result-count');
    const totalCount = this.filterer.allCommands.length;

    resultCount.textContent = `${results.length} of ${totalCount} commands`;

    if (this.resultCallback) {
      this.resultCallback(results);
    }
  }

  /**
   * Set callback for when results change
   */
  onResultsChange(callback) {
    this.resultCallback = callback;
  }
}

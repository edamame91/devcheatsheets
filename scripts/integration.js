/**
 * Integration module - glues together commands, renderer, and filters
 */

import { renderCommandGrid, initCommandCardsInContainer } from './command-renderer.js';
import { CommandFilter, FilterUIController } from './filter.js';

export class CommandsPageController {
  constructor(commands, pageConfig = {}) {
    this.commands = commands;
    this.pageConfig = {
      containerSelector: '#command-grid',
      filterSelector: '#filter-toolbar',
      ...pageConfig,
    };
    
    this.filter = new CommandFilter(commands);
    this.filterUI = null;
  }

  /**
   * Initialize the entire page
   */
  async init() {
    // Create filter UI
    this.filterUI = new FilterUIController(this.filter, this.pageConfig.filterSelector);
    this.filterUI.render();

    // Initial render
    this.renderCommands(this.commands);

    // Wire up filter results callback
    this.filterUI.onResultsChange((results) => {
      this.renderCommands(results);
    });
  }

  /**
   * Render commands to the grid
   */
  renderCommands(commands) {
    const container = document.querySelector(this.pageConfig.containerSelector);
    if (!container) {
      console.error(`Container not found: ${this.pageConfig.containerSelector}`);
      return;
    }

    const html = renderCommandGrid(commands);
    container.innerHTML = html;
    
    // Initialize interactivity for all rendered cards
    initCommandCardsInContainer(container);
  }

  /**
   * Get current filtered results
   */
  getFiltered() {
    return this.filter.getFiltered();
  }
}

/**
 * Helper to initialize on common pages
 */
export function initCommandsPage(commands, containerSelector = '#command-grid', filterSelector = '#filter-toolbar') {
  const controller = new CommandsPageController(commands, {
    containerSelector,
    filterSelector,
  });

  document.addEventListener('DOMContentLoaded', () => {
    controller.init();
  });

  return controller;
}

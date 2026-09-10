
export function renderCommandCard(command, uniqueId) {
  const riskBadge = getRiskBadge(command.risk);
  const adminBadge = command.adminRequired ? '<span class="badge badge-admin">Admin</span>' : '';
  const warningHtml = command.warning ? `<div class="warning-box">${command.warning}</div>` : '';

  return `
    <div class="command-card" data-command-id="${uniqueId}">
      <div class="command-header" role="button" tabindex="0" aria-expanded="false">
        <div class="command-title">
          <code class="command-name">${escapeHtml(command.name)}</code>
          <span class="command-desc">${escapeHtml(command.description)}</span>
        </div>
        <div class="command-badges">
          ${riskBadge}
          ${adminBadge}
        </div>
        <div class="expand-toggle" aria-hidden="true">▶</div>
      </div>
      
      <div class="command-details" style="display: none;">
        ${warningHtml}
        
        <section class="detail-section">
          <h4>Syntax</h4>
          <code class="syntax-block">${escapeHtml(command.syntax)}</code>
        </section>

        ${command.parameters && command.parameters.length > 0 ? `
          <section class="detail-section">
            <h4>Common Parameters</h4>
            <table class="params-table">
              <tbody>
                ${command.parameters.map(p => `
                  <tr>
                    <td><code>${escapeHtml(p.param)}</code></td>
                    <td>${escapeHtml(p.desc)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </section>
        ` : ''}

        ${command.examples && command.examples.length > 0 ? `
          <section class="detail-section">
            <h4>Examples</h4>
            <div class="examples-list">
              ${command.examples.map((example, idx) => `
                <div class="example-item">
                  <div class="example-code-wrapper">
                    <code class="example-code">${escapeHtml(example)}</code>
                    <button class="copy-btn" data-command-id="${uniqueId}" data-example-idx="${idx}" 
                            aria-label="Copy example" title="Copy to clipboard">
                      <span class="copy-icon">📋</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${command.useCases ? `
          <section class="detail-section">
            <h4>IT Support Use</h4>
            <p>${escapeHtml(command.useCases)}</p>
          </section>
        ` : ''}

        ${command.relatedCommands && command.relatedCommands.length > 0 ? `
          <section class="detail-section">
            <h4>Related Commands</h4>
            <p>${command.relatedCommands.map(c => `<code>${escapeHtml(c)}</code>`).join(', ')}</p>
          </section>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Get HTML badge for risk level
 */
function getRiskBadge(risk) {
  const badges = {
    readonly: '<span class="badge badge-readonly">Read-only</span>',
    modifies_system: '<span class="badge badge-warning">Modifies System</span>',
    destructive: '<span class="badge badge-danger">⚠ Destructive</span>',
  };
  return badges[risk] || '';
}

/**
 * Escape HTML to prevent injection
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize expand/collapse behavior for a command card
 */
export function initCommandCardInteractivity(cardElement) {
  const header = cardElement.querySelector('.command-header');
  const details = cardElement.querySelector('.command-details');
  const toggle = cardElement.querySelector('.expand-toggle');

  function toggleExpanded() {
    const isExpanded = details.style.display !== 'none';
    details.style.display = isExpanded ? 'none' : 'block';
    header.setAttribute('aria-expanded', !isExpanded);
    toggle.textContent = isExpanded ? '▶' : '▼';
  }

  // Click to toggle
  header.addEventListener('click', toggleExpanded);

  // Keyboard support (Enter/Space)
  header.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpanded();
    }
  });

  // Copy buttons for examples - get text from the code element
  cardElement.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Find the sibling code element and get its text
      const codeElement = btn.previousElementSibling;
      if (codeElement && codeElement.classList.contains('example-code')) {
        const exampleText = codeElement.textContent;
        copyToClipboard(exampleText, btn);
      }
    });
  });
}

/**
 * Copy text to clipboard with visual feedback
 */
export function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    // Visual feedback
    const originalHtml = button.innerHTML;
    button.innerHTML = '<span class="copy-icon">✓</span>';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.innerHTML = originalHtml;
      button.classList.remove('copied');
    }, 1500);
  }).catch(() => {
    // Fallback: old method
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      button.innerHTML = '<span class="copy-icon">✓</span>';
      setTimeout(() => {
        button.innerHTML = '<span class="copy-icon">📋</span>';
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    document.body.removeChild(textarea);
  });
}

/**
 * Render a grid of command cards (returns HTML string)
 */
export function renderCommandGrid(commandsArray) {
  return commandsArray.map((cmd, idx) => {
    const uniqueId = `${cmd.shell}-${cmd.name}-${idx}`;
    return renderCommandCard(cmd, uniqueId);
  }).join('');
}

/**
 * Initialize all command cards in a container
 */
export function initCommandCardsInContainer(container) {
  if (!container) return;
  
  container.querySelectorAll('.command-card').forEach((card) => {
    const commandId = card.dataset.commandId;
    initCommandCardInteractivity(card);
  });
}

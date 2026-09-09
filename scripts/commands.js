/**
 * Comprehensive command database
 * Each command contains metadata, syntax, parameters, examples, and context
 */

export const SHELL_TYPES = {
  POWERSHELL: 'powershell',
  BASH: 'bash',
  CMD: 'cmd',
  MACOS: 'macos',
};

export const CATEGORIES = {
  SYSTEM_INFO: 'System Information',
  PROCESSES: 'Processes & Applications',
  SERVICES: 'Services',
  NETWORKING: 'Networking',
  FILES: 'Files & Folders',
  PERMISSIONS: 'Permissions & ACLs',
  USERS: 'Users & Accounts',
  DISKS: 'Disks & Storage',
  DEVICES: 'Hardware & Devices',
  PRINTERS: 'Printers',
  EVENT_LOGS: 'Event Logs',
  WINDOWS_TROUBLESHOOTING: 'Windows Troubleshooting',
  ACTIVE_DIRECTORY: 'Active Directory',
  REMOTE_SUPPORT: 'Remote Support',
  GIT: 'Git',
  SCRIPTING: 'Scripting',
};

export const RISK_LEVELS = {
  READONLY: 'readonly',
  MODIFIES_SYSTEM: 'modifies_system',
  DESTRUCTIVE: 'destructive',
};

/**
 * PowerShell commands
 */
export const powershellCommands = [
  {
    name: 'Get-Process',
    shell: SHELL_TYPES.POWERSHELL,
    category: CATEGORIES.PROCESSES,
    risk: RISK_LEVELS.READONLY,
    adminRequired: false,
    description: 'List running processes with CPU and memory usage',
    syntax: 'Get-Process [-Name <String>] [-ComputerName <String>]',
    parameters: [
      { param: '-Name', desc: 'Filter by process name (wildcard supported)' },
      { param: '-ComputerName', desc: 'Query a remote computer' },
      { param: '-IncludeUserName', desc: 'Show which user owns the process' },
    ],
    examples: [
      'Get-Process',
      'Get-Process -Name chrome',
      'Get-Process | Sort-Object CPU -Descending | Select-Object -First 5',
      'Get-Process | Where-Object { $_.WorkingSet -gt 500MB }',
    ],
    useCases: 'Check whether an application is running, find a process consuming excessive resources, identify resource hogs, monitor application health.',
    relatedCommands: ['Stop-Process', 'Get-WmiObject', 'Task Manager'],
  },
  {
    name: 'Stop-Process',
    shell: SHELL_TYPES.POWERSHELL,
    category: CATEGORIES.PROCESSES,
    risk: RISK_LEVELS.DESTRUCTIVE,
    adminRequired: false,
    description: 'Terminate a running process',
    syntax: 'Stop-Process [-Name <String>] [-Force] [-WhatIf]',
    parameters: [
      { param: '-Name', desc: 'Process name to kill' },
      { param: '-Id', desc: 'Process ID (PID)' },
      { param: '-Force', desc: 'Force termination without prompting' },
      { param: '-WhatIf', desc: 'Show what would happen without doing it' },
    ],
    examples: [
      'Stop-Process -Name notepad',
      'Stop-Process -Id 1234 -Force',
      'Get-Process chrome | Stop-Process -Force',
    ],
    useCases: 'Force-close a frozen application, stop resource-hogging processes, automate cleanup tasks.',
    relatedCommands: ['Get-Process', 'Taskkill (CMD)'],
    warning: 'Terminating processes can cause data loss. Use -WhatIf first.',
  },
  {
    name: 'Get-Service',
    shell: SHELL_TYPES.POWERSHELL,
    category: CATEGORIES.SERVICES,
    risk: RISK_LEVELS.READONLY,
    adminRequired: false,
    description: 'List Windows services and their status',
    syntax: 'Get-Service [-Name <String>] [-ComputerName <String>]',
    parameters: [
      { param: '-Name', desc: 'Filter by service name (wildcard supported)' },
      { param: '-ComputerName', desc: 'Query a remote computer' },
      { param: '-DisplayName', desc: 'Filter by display name' },
    ],
    examples: [
      'Get-Service',
      'Get-Service -Name wmi*',
      'Get-Service | Where-Object { $_.Status -eq "Running" }',
      'Get-Service | Where-Object { $_.StartType -eq "Automatic" } | Sort-Object Status',
    ],
    useCases: 'Check service status, troubleshoot service-related issues, audit which services are running.',
    relatedCommands: ['Start-Service', 'Stop-Service', 'Restart-Service', 'Set-Service'],
  },
];

/**
 * Export for use in other modules
 */
export const commands = {
  [SHELL_TYPES.POWERSHELL]: powershellCommands,
};

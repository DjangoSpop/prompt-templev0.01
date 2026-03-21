/**
 * Module 21: Human-in-the-Loop & Production Guardrails
 * Duration: 25 minutes | 3 Lessons
 */

import type { Lesson } from '../../types';

export const module21Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 21.1: Human-in-the-Loop Patterns
  // ==========================================================================
  {
    id: 'lesson-21-1',
    moduleId: 'module-21',
    title: 'Human-in-the-Loop Patterns',
    estimatedTime: 8,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'AI agents are powerful but not infallible. In production systems — especially those handling money, sensitive data, or customer communications — you need human oversight at critical decision points. Human-in-the-loop (HITL) patterns let AI handle routine work at machine speed while routing high-stakes decisions to humans for review and approval.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Human-in-the-Loop Matters',
      },
      {
        type: 'text',
        value: 'Even the best AI agents make mistakes. They hallucinate facts, misinterpret context, and occasionally take actions that seem reasonable to them but are clearly wrong to a human. HITL patterns provide a safety net that catches these errors before they reach customers or affect real systems.',
      },
      {
        type: 'list',
        items: [
          'Financial actions: Refunds over $100, payment processing, invoice generation',
          'Customer communications: Emails to VIP clients, public-facing responses, legal notices',
          'Data modifications: Deleting records, bulk updates, permission changes',
          'Compliance decisions: GDPR data requests, account closures, fraud flagging',
          'Irreversible actions: Anything that cannot be easily undone should have human review',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The 80/20 Rule of Automation',
        text: 'In most workflows, 80% of cases are routine and can be fully automated. The remaining 20% are edge cases, exceptions, or high-value decisions that benefit from human judgment. HITL patterns let you automate the 80% while protecting against the 20%.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Pattern 1: Approval Workflows',
      },
      {
        type: 'text',
        value: 'The approval workflow is the most common HITL pattern. The AI agent prepares an action (like a draft email or refund request), then pauses execution and sends the proposal to a human for approval. The workflow resumes only after the human approves, rejects, or modifies the action.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "approval_workflow": {\n    "step_1": "AI Agent drafts a refund for $250",\n    "step_2": "Wait node pauses execution",\n    "step_3": "Slack message sent to #approvals channel with refund details and Approve/Reject buttons",\n    "step_4_approve": "Workflow resumes → Process refund → Notify customer",\n    "step_4_reject": "Workflow resumes → Log rejection → AI drafts alternative response",\n    "timeout": "If no response in 4 hours, escalate to manager"\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Pattern 2: Review Gates',
      },
      {
        type: 'text',
        value: 'Review gates add a checkpoint where a human reviews AI output before it\'s sent to the end user. The AI generates a draft, the human reviews and optionally edits it, then the finalized version is delivered. This is essential for customer-facing communications.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "review_gate": {\n    "trigger": "Customer complaint received",\n    "ai_step": "Agent drafts response using complaint history and company policies",\n    "review": {\n      "channel": "Slack #support-review",\n      "message": "AI drafted this response to {customer}. Review and click Send or Edit.",\n      "editable": true\n    },\n    "delivery": "Approved/edited response sent to customer via email"\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Pattern 3: Escalation Paths',
      },
      {
        type: 'text',
        value: 'Escalation paths define when and how an AI agent should hand off to a human. The agent should escalate when it detects low confidence, encounters an unfamiliar scenario, or when the user explicitly asks for a human. Good escalation preserves context — the human should see everything the AI learned.',
      },
      {
        type: 'list',
        items: [
          'Confidence-based: Agent escalates when its confidence score drops below a threshold (e.g., the LLM expresses uncertainty)',
          'Rule-based: Specific triggers force escalation (e.g., customer mentions "lawyer", refund exceeds limit, account is flagged)',
          'User-initiated: Customer says "let me talk to a human" — always honor this immediately',
          'Loop detection: Agent has called tools more than N times without resolving — escalate to avoid infinite loops',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Implementing in n8n',
        text: 'n8n\'s Wait node is the key to HITL patterns. It pauses workflow execution and resumes when triggered by a webhook (from Slack buttons, email links, or a custom UI). Combine Wait with Slack/Teams notifications for a production-ready approval system.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Context Handoff',
      },
      {
        type: 'text',
        value: 'When escalating to a human, always include the full context: the customer\'s original request, what the AI attempted, what tools it called, what results it got, and why it escalated. A human receiving a bare "customer needs help" message is much less effective than one receiving a complete summary of the AI\'s attempts. Build your escalation workflows to compile a context package before notifying the human.',
      },
    ],
  },
  // ==========================================================================
  // LESSON 21.2: Production Guardrails
  // ==========================================================================
  {
    id: 'lesson-21-2',
    moduleId: 'module-21',
    title: 'Production Guardrails',
    estimatedTime: 9,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Guardrails are automated safety mechanisms that protect your AI agent systems from producing harmful, incorrect, or unexpected outputs. Unlike HITL patterns that involve humans, guardrails operate automatically at machine speed — validating inputs, filtering outputs, limiting rates, and handling errors before they cause damage.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Input Validation',
      },
      {
        type: 'text',
        value: 'Never trust input to your AI agents — whether it comes from users, webhooks, or other systems. Validate all inputs before they reach your LLM or tools.',
      },
      {
        type: 'list',
        items: [
          'Type checking: Ensure email fields contain valid emails, numbers are within expected ranges, dates are parseable',
          'Length limits: Cap input text length to prevent token abuse (e.g., max 2,000 characters for a chat message)',
          'Injection detection: Watch for prompt injection attempts — inputs that try to override the system prompt ("ignore all previous instructions...")',
          'Schema validation: Use JSON Schema validation for structured inputs, especially from webhooks and MCP tool calls',
          'Sanitization: Strip HTML, script tags, and control characters from user inputs before processing',
        ],
        ordered: false,
      },
      {
        type: 'code',
        language: 'javascript',
        code: '// Input validation in an n8n Code node\nconst input = $input.first().json;\n\n// Length check\nif (input.message.length > 2000) {\n  throw new Error(\'Message exceeds maximum length of 2000 characters\');\n}\n\n// Basic prompt injection detection\nconst injectionPatterns = [\n  /ignore (all |any )?(previous|prior|above) (instructions|prompts)/i,\n  /you are now/i,\n  /system prompt/i,\n  /\\[INST\\]/i,\n];\n\nconst isInjection = injectionPatterns.some(p => p.test(input.message));\nif (isInjection) {\n  return [{ json: { blocked: true, reason: \'Potential prompt injection detected\' } }];\n}\n\nreturn [$input.first()];',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Defense in Depth',
        text: 'No single guardrail is foolproof. Layer multiple defenses: input validation catches obvious attacks, the system prompt defines boundaries, output filtering catches leaks, and rate limiting prevents abuse. Together, they create a robust defense.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Output Filtering',
      },
      {
        type: 'text',
        value: 'After the AI generates a response, filter it before sending to the user. Output filters catch cases where the AI accidentally leaks sensitive information, generates inappropriate content, or hallucinates data that should be verified.',
      },
      {
        type: 'list',
        items: [
          'PII detection: Scan for credit card numbers, SSNs, passwords, API keys in the response and redact them',
          'Hallucination checks: When the agent references specific data (order numbers, prices), verify against the source data before responding',
          'Tone checking: For customer-facing agents, use a secondary LLM call to verify the response is professional and on-brand',
          'Forbidden content: Block responses that contain competitor mentions, pricing you don\'t offer, or promises you can\'t keep',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Rate Limiting',
      },
      {
        type: 'text',
        value: 'Rate limiting protects your system from abuse and runaway costs. Without rate limits, a malicious user (or a buggy integration) could trigger thousands of LLM calls, racking up massive API bills.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "rate_limiting_strategy": {\n    "per_user": {\n      "max_requests": 50,\n      "window": "1 hour",\n      "action": "Return friendly rate limit message"\n    },\n    "per_workflow": {\n      "max_executions": 1000,\n      "window": "1 day",\n      "action": "Pause workflow and alert admin"\n    },\n    "cost_ceiling": {\n      "max_daily_llm_spend": "$50",\n      "action": "Switch to cheaper model or queue requests"\n    }\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Error Handling',
      },
      {
        type: 'text',
        value: 'Production AI systems must handle errors gracefully. LLM APIs go down, databases timeout, and external services return unexpected responses. Build your n8n workflows with comprehensive error handling.',
      },
      {
        type: 'list',
        items: [
          'Use n8n\'s Error Trigger node to catch workflow failures and route them to alerting',
          'Set timeout limits on all HTTP requests and LLM calls (30 seconds is a good default)',
          'Implement retry logic with exponential backoff for transient failures (n8n\'s Retry On Fail setting)',
          'Provide fallback responses when the AI fails: "I\'m having trouble processing your request. Let me connect you with a team member."',
          'Log all errors with context (input, step that failed, error message) for debugging',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Error Handling Template',
        text: 'Create a reusable "error handler" sub-workflow that logs the error to your database, sends a Slack alert to the dev channel, and returns a friendly fallback response. Connect it to every production agent workflow via the Error Trigger node.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Guardrails Checklist',
      },
      {
        type: 'text',
        value: 'Before deploying any AI agent to production, verify these guardrails are in place: input validation on all entry points, output filtering for PII and hallucinations, rate limiting per user and per workflow, error handling with fallback responses, cost ceilings on LLM API spend, logging of all agent actions for audit trails, and regular review of agent behavior through monitoring dashboards.',
      },
    ],
  },
  // ==========================================================================
  // LESSON 21.3: Monitoring & Observability
  // ==========================================================================
  {
    id: 'lesson-21-3',
    moduleId: 'module-21',
    title: 'Monitoring & Observability',
    estimatedTime: 8,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'You can\'t improve what you can\'t measure. Monitoring and observability are essential for production AI agent systems. Unlike traditional software where bugs produce consistent errors, AI agents can "drift" — gradually producing worse outputs without any hard failures. Comprehensive monitoring catches these subtle degradations before your users do.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Key Metrics to Track',
      },
      {
        type: 'text',
        value: 'Production AI agents generate a wealth of signals. Focus on these core metrics:',
      },
      {
        type: 'list',
        items: [
          'Execution success rate — Percentage of workflow runs that complete without errors. Target: >99%',
          'Average response time — Time from user input to agent response. Track P50, P95, and P99 latencies',
          'Tool call patterns — Which tools the agent calls most frequently, success rate per tool, average tool latency',
          'Escalation rate — Percentage of conversations escalated to humans. Rising rates may indicate a prompt problem',
          'Token usage — Tokens consumed per execution, tracked by model. Critical for cost management',
          'User satisfaction — If you have feedback mechanisms (thumbs up/down), track satisfaction trends over time',
          'Error distribution — Types and frequencies of errors. Are they LLM timeouts? Tool failures? Input validation blocks?',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Logging Strategy',
      },
      {
        type: 'text',
        value: 'Implement structured logging for every agent interaction. Each log entry should capture enough context to reconstruct the full conversation and understand every decision the agent made.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "log_entry": {\n    "timestamp": "2025-01-15T10:30:00Z",\n    "workflow_id": "wf_customer_support",\n    "execution_id": "exec_abc123",\n    "session_id": "session_xyz789",\n    "user_input": "Where is my order #5678?",\n    "agent_steps": [\n      {\n        "step": 1,\n        "thought": "User wants order status. Need to look up order #5678.",\n        "tool": "lookup_order",\n        "tool_input": { "order_id": "5678" },\n        "tool_output": { "status": "shipped", "tracking": "1Z999AA10123456784" },\n        "latency_ms": 245\n      },\n      {\n        "step": 2,\n        "thought": "Found the order. It\'s shipped with tracking. Let me get shipping details.",\n        "tool": "check_shipping",\n        "tool_input": { "tracking": "1Z999AA10123456784" },\n        "tool_output": { "status": "in_transit", "eta": "2025-01-16" },\n        "latency_ms": 312\n      }\n    ],\n    "final_response": "Your order #5678 is currently in transit and is expected to arrive by January 16th.",\n    "total_tokens": 1847,\n    "total_latency_ms": 1523,\n    "model": "gpt-4o",\n    "cost_usd": 0.028\n  }\n}',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Log Storage',
        text: 'Store agent logs in a database (Postgres, Supabase, or a dedicated logging service like Datadog). n8n\'s built-in execution log is useful for debugging but not suitable for production analytics. Build a dedicated logging workflow that captures structured data from every agent execution.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Alerting Rules',
      },
      {
        type: 'text',
        value: 'Set up automated alerts for conditions that need immediate attention:',
      },
      {
        type: 'list',
        items: [
          'Error rate exceeds 5% over a 15-minute window — potential system issue',
          'Average response time exceeds 10 seconds — LLM or tool performance degradation',
          'Daily LLM cost exceeds budget threshold — possible abuse or runaway loop',
          'Escalation rate spikes above 30% — prompt or tool may need adjustment',
          'Specific tool failure rate exceeds 10% — external service may be down',
          'Zero executions for 30 minutes during business hours — workflow may be paused or broken',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Performance Tracking Dashboard',
      },
      {
        type: 'text',
        value: 'Build a monitoring dashboard that gives you at-a-glance visibility into your AI agent fleet. Use n8n workflows to aggregate metrics and push them to your dashboard tool of choice (Grafana, Datadog, or even a simple n8n workflow that updates a Notion database).',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "dashboard_panels": [\n    "Executions per hour (line chart, last 24h)",\n    "Success/failure rate (pie chart, today)",\n    "P50/P95 response time (line chart, last 7 days)",\n    "Token usage by model (stacked bar, last 30 days)",\n    "Daily cost (line chart with budget line, last 30 days)",\n    "Top 10 error messages (table, last 24h)",\n    "Escalation rate trend (line chart, last 30 days)",\n    "Active sessions (gauge, real-time)"\n  ]\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Scaling Strategies',
      },
      {
        type: 'text',
        value: 'As your AI agent workloads grow, you\'ll need to scale your n8n infrastructure. Here are proven strategies:',
      },
      {
        type: 'list',
        items: [
          'Queue mode: Enable n8n\'s built-in queue mode with Redis/BullMQ to distribute executions across multiple worker processes',
          'Horizontal scaling: Run multiple n8n instances behind a load balancer, sharing a common Postgres database and Redis queue',
          'Workflow optimization: Move expensive operations (large LLM calls, file processing) to dedicated sub-workflows with separate scaling',
          'Caching: Cache frequently requested data (product info, user profiles) to reduce database and API calls',
          'Model tiering: Use cheaper/faster models (GPT-4o-mini) for simple tasks, reserving expensive models (GPT-4o, Claude Opus) for complex reasoning',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Production Readiness Checklist',
        text: 'Before going live: (1) All guardrails implemented, (2) Structured logging on every workflow, (3) Alerting rules configured, (4) Dashboard showing key metrics, (5) Error handler sub-workflow connected, (6) Rate limits set, (7) Cost ceilings in place, (8) Escalation paths tested, (9) Load testing completed. Check every box before serving real users.',
      },
    ],
  },
];

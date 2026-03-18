import { ForageTools } from './forage-tools.js';

export const FORAGE_TOOLS = [
  // Core Tools
  {
    name: 'search_web',
    description: 'Real-time web search. Use for current information, news, or when you need results stored in knowledge graph.',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        num_results: { type: 'number', default: 10 }
      },
      required: ['query']
    }
  },
  {
    name: 'scrape_page',
    description: 'Extract clean text content from any URL.',
    schema: {
      type: 'object',
      properties: { url: { type: 'string' } },
      required: ['url']
    }
  },
  {
    name: 'get_company_info',
    description: 'Get website summary and email contacts for a company domain.',
    schema: {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        find_emails: { type: 'boolean', default: true }
      },
      required: ['domain']
    }
  },
  {
    name: 'find_emails',
    description: 'Find verified email addresses for people at a company.',
    schema: {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        limit: { type: 'number', default: 10 }
      },
      required: ['domain']
    }
  },
  {
    name: 'find_leads',
    description: 'Generate B2B lead list with verified emails. Filter by job_title, location, industry.',
    schema: {
      type: 'object',
      properties: {
        job_title: { type: 'string' },
        location: { type: 'string' },
        industry: { type: 'string' },
        company_size: { type: 'string' },
        num_leads: { type: 'number', default: 100 }
      },
      required: ['job_title']
    }
  },
  // Knowledge Graph Tools
  {
    name: 'query_knowledge',
    description: 'Search the knowledge graph for previously researched entities.',
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        entity_type: { type: 'string', enum: ['Company', 'Person', 'Location', 'Industry', 'any'], default: 'any' }
      },
      required: ['question']
    }
  },
  {
    name: 'enrich_entity',
    description: 'Retrieve all accumulated data about a company from the knowledge graph.',
    schema: {
      type: 'object',
      properties: {
        identifier: { type: 'string' }
      },
      required: ['identifier']
    }
  },
  {
    name: 'get_claims',
    description: 'Retrieve all claims/provenance assertions for an entity from the knowledge graph.',
    schema: {
      type: 'object',
      properties: {
        entity: { type: 'string' }
      },
      required: ['entity']
    }
  },
  {
    name: 'add_claim',
    description: 'Add a provenance claim to the knowledge graph.',
    schema: {
      type: 'object',
      properties: {
        entity: { type: 'string' },
        relation: { type: 'string' },
        target: { type: 'string' },
        assertion: { type: 'string' },
        source_url: { type: 'string' },
        confidence: { type: 'number', default: 0.8 }
      },
      required: ['entity', 'relation', 'target', 'assertion']
    }
  },
  {
    name: 'get_regime',
    description: 'Get the current regime label for an entity (normal, stressed, pre_tipping, post_event).',
    schema: {
      type: 'object',
      properties: {
        entity: { type: 'string' }
      },
      required: ['entity']
    }
  },
  {
    name: 'set_regime',
    description: 'Set the regime label for an entity.',
    schema: {
      type: 'object',
      properties: {
        entity: { type: 'string' },
        regime: { type: 'string', enum: ['normal', 'stressed', 'pre_tipping', 'post_event'] }
      },
      required: ['entity', 'regime']
    }
  },
  {
    name: 'get_signals',
    description: 'Retrieve time-series signal data for an entity.',
    schema: {
      type: 'object',
      properties: {
        entity: { type: 'string' },
        metric: { type: 'string' },
        limit: { type: 'number', default: 100 }
      },
      required: ['entity']
    }
  },
  {
    name: 'add_signal',
    description: 'Add a time-series data point for an entity.',
    schema: {
      type: 'object',
      properties: {
        entity: { type: 'string' },
        metric: { type: 'string' },
        value: { type: 'number' },
        timestamp: { type: 'number' }
      },
      required: ['entity', 'metric', 'value']
    }
  },
  {
    name: 'get_causal_parents',
    description: 'Find entities that drive/caused this entity upstream.',
    schema: {
      type: 'object',
      properties: {
        entity: { type: 'string' },
        limit: { type: 'number', default: 10 }
      },
      required: ['entity']
    }
  },
  {
    name: 'get_causal_children',
    description: 'Find entities this entity drives downstream.',
    schema: {
      type: 'object',
      properties: {
        entity: { type: 'string' },
        limit: { type: 'number', default: 10 }
      },
      required: ['entity']
    }
  },
  {
    name: 'get_causal_path',
    description: 'Find the highest causal-weight path between two entities.',
    schema: {
      type: 'object',
      properties: {
        from_entity: { type: 'string' },
        to_entity: { type: 'string' }
      },
      required: ['from_entity', 'to_entity']
    }
  },
  {
    name: 'simulate',
    description: 'Simulate a shock/boost/remove intervention on an entity.',
    schema: {
      type: 'object',
      properties: {
        entity: { type: 'string' },
        intervention: { type: 'string', enum: ['shock', 'boost', 'remove'] },
        depth: { type: 'number', default: 3 }
      },
      required: ['entity', 'intervention']
    }
  },
  // Skills
  {
    name: 'skill_company_dossier',
    description: 'Comprehensive company research with website summary, emails, and 10 key contacts.',
    schema: {
      type: 'object',
      properties: { domain: { type: 'string' } },
      required: ['domain']
    }
  },
  {
    name: 'skill_prospect_company',
    description: 'Find 15 decision makers at a company with verified emails.',
    schema: {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        seniority: { type: 'string', default: 'senior,director,vp,c_suite' }
      },
      required: ['domain']
    }
  },
  {
    name: 'skill_funding_intel',
    description: 'Get funding history, investors, and recent news for a company.',
    schema: {
      type: 'object',
      properties: {
        company_name: { type: 'string' },
        domain: { type: 'string' }
      },
      required: ['company_name']
    }
  },
  {
    name: 'skill_job_signals',
    description: 'Analyze job listings to reveal hiring strategy and growth areas.',
    schema: {
      type: 'object',
      properties: {
        company_name: { type: 'string' },
        domain: { type: 'string' }
      },
      required: ['company_name']
    }
  },
  {
    name: 'skill_tech_stack',
    description: 'Detect technologies and platforms a company uses.',
    schema: {
      type: 'object',
      properties: { domain: { type: 'string' } },
      required: ['domain']
    }
  },
  {
    name: 'skill_competitor_intel',
    description: 'Analyze competitor pricing, features, and reviews.',
    schema: {
      type: 'object',
      properties: {
        competitor_url: { type: 'string' },
        focus: { type: 'string', enum: ['pricing', 'features', 'both'], default: 'both' }
      },
      required: ['competitor_url']
    }
  }
];

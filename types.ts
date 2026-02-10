/**
 * @typedef {Object} Entity
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Array<string>} attributes
 */

/**
 * @typedef {Object} Relationship
 * @property {string} source
 * @property {string} target
 * @property {string} type
 * @property {string=} cardinality
 */

/**
 * @typedef {Object} CoreFlow
 * @property {string} id
 * @property {string} name
 * @property {Array<string>} steps
 */

/**
 * @typedef {Object} ArchitecturePlan
 * @property {Array<string>} frontend
 * @property {Array<string>} backend
 * @property {Array<string>} infrastructure
 * @property {Array<Object<string,string>>} apiSchemas
 * @property {Array<string>} securityRequirements
 * @property {Record<string, string[]>} folderStructure
 */

/**
 * @typedef {Object} WorkspaceFiles
 * @property {string} cursorRules
 * @property {string} readme
 * @property {Record<string,string>} boilerplate
 */

/**
 * @typedef {Object} PipelineResult
 * @property {{entities: Entity[], relationships: Relationship[], coreFlows: CoreFlow[]}} stage1
 * @property {ArchitecturePlan} stage2
 * @property {{masterPrompt: string, workspaceFiles: WorkspaceFiles}} stage3
 */

/**
 * @typedef {Object} OnboardingStep
 * @property {string} id
 * @property {string} question
 * @property {string} answer
 */

/**
 * @typedef {Object} RoiEstimate
 * @property {number} tokenInput
 * @property {number} tokenOutput
 * @property {number} estimatedApiCost
 * @property {number} estimatedDevHoursSaved
 * @property {number} estimatedDollarSavings
 */

/**
 * @typedef {Object} CreativeAsset
 * @property {'image'|'video'} type
 * @property {string} prompt
 * @property {string} format
 * @property {string} url
 * @property {number} createdAt
 */

/**
 * @typedef {Object} ChatTurn
 * @property {'user'|'assistant'|'system'} role
 * @property {string} content
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ProjectData
 * @property {string} id
 * @property {string} name
 * @property {string} problemStatement
 * @property {string} industry
 * @property {string} audience
 * @property {OnboardingStep[]} onboarding
 * @property {RoiEstimate} roi
 * @property {PipelineResult|null} pipeline
 * @property {CreativeAsset[]} creativeAssets
 * @property {ChatTurn[]} copilotTranscript
 * @property {string[]} documentationSections
 * @property {number} createdAt
 * @property {number} updatedAt
 */

export const TypeRegistry = {
  version: '1.0.0',
  description: 'JSDoc runtime-compatible registry for AI Conception Studio Pro types'
};


import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { linkedinWorkflow } from './workflows/linkedin-workflow';
import { weatherAgent } from './agents/weather-agent';
import { linkedinAgent } from './agents/linkedin-agent';

export const mastra = new Mastra({
  workflows: { weatherWorkflow, linkedinWorkflow },
  agents: { weatherAgent, linkedinAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

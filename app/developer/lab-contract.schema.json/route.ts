import { labContractSchemaV1 } from '../../../tools/lab-contract/index.ts';

export function GET() {
  return Response.json(labContractSchemaV1);
}

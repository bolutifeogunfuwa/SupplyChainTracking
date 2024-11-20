;; tests/quality-assurance_test.ts

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that quality checkpoints can be added by authorized inspectors",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Add authorized inspector
    let block = chain.mineBlock([
      Tx.contractCall('quality-assurance', 'add-authorized-inspector', [types.principal(wallet1.address)], deployer.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Add quality checkpoint
    block = chain.mineBlock([
      Tx.contractCall('quality-assurance', 'add-quality-checkpoint', [
        types.uint(1),
        types.ascii("PASSED"),
        types.ascii("All quality standards met")
      ], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Get quality checkpoints
    let result = chain.callReadOnlyFn('quality-assurance', 'get-quality-checkpoints', [types.uint(1)], deployer.address);
    assertEquals(result.result.expectSome().expectList().length, 1);
  },
});

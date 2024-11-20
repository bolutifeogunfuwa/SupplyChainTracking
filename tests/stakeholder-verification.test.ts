;; tests/stakeholder-verification_test.ts

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that stakeholders can be registered and verified",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Register stakeholder
    let block = chain.mineBlock([
      Tx.contractCall('stakeholder-verification', 'register-stakeholder', [
        types.ascii("John Doe"),
        types.ascii("Supplier")
      ], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Add verifier
    block = chain.mineBlock([
      Tx.contractCall('stakeholder-verification', 'add-verifier', [types.principal(wallet2.address)], deployer.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Verify stakeholder
    block = chain.mineBlock([
      Tx.contractCall('stakeholder-verification', 'verify-stakeholder', [types.principal(wallet1.address)], wallet2.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Get stakeholder info
    let result = chain.callReadOnlyFn('stakeholder-verification', 'get-stakeholder', [types.principal(wallet1.address)], deployer.address);
    assertEquals(result.result.expectSome().expectTuple()['verified'], true);
  },
});

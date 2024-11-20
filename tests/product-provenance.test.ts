;; tests/product-provenance_test.ts

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that products can be registered and transferred",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Register product
    let block = chain.mineBlock([
      Tx.contractCall('product-provenance', 'register-product', [
        types.ascii("Test Product"),
        types.ascii("Factory A")
      ], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1)');
    
    // Transfer product
    block = chain.mineBlock([
      Tx.contractCall('product-provenance', 'transfer-product', [
        types.uint(1),
        types.principal(wallet2.address),
        types.ascii("Warehouse B")
      ], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Get product history
    let result = chain.callReadOnlyFn('product-provenance', 'get-product-history', [types.uint(1)], wallet1.address);
    assertEquals(result.result.expectSome().expectList().length, 2);
  },
});

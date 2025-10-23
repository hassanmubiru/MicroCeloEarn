// Simple test to verify admin access logic
const ADMIN_ADDRESS = "0x50625608E728cad827066dD78F5B4e8d203619F3"

function testAdminAccess(userAddress) {
  console.log("🔍 Testing admin access...")
  console.log(`👤 User Address: ${userAddress}`)
  console.log(`👤 Admin Address: ${ADMIN_ADDRESS}`)
  
  const isYourAddress = userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase()
  console.log(`✅ Is admin address? ${isYourAddress}`)
  
  if (isYourAddress) {
    console.log("🎉 Admin access should be granted!")
    return true
  } else {
    console.log("❌ Admin access denied")
    return false
  }
}

// Test with your address
console.log("=== Test 1: Your Address ===")
testAdminAccess("0x50625608E728cad827066dD78F5B4e8d203619F3")

// Test with different address
console.log("\n=== Test 2: Different Address ===")
testAdminAccess("0x1234567890123456789012345678901234567890")

console.log("\n✅ Admin access test completed!")

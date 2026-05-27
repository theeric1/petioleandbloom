import ShopifyBuy from '@shopify/buy-button-js';

let uiInstance: any = null;
let cartInstance: any = null;

export const initShopify = () => {
  if (uiInstance) return; // Already initialized

  const domain = import.meta.env.VITE_SHOPIFY_DOMAIN || 'your-shop-name.myshopify.com';
  const storefrontAccessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || 'your_storefront_access_token';

  // Only initialize if we have real tokens (prevents crashing during development if not set)
  if (domain === 'your-shop-name.myshopify.com') {
    console.warn("Shopify Buy Button missing credentials in .env. Cart will not render.");
    return;
  }

  const client = ShopifyBuy.buildClient({
    domain,
    storefrontAccessToken,
  });

  uiInstance = ShopifyBuy.UI.init(client);
  
  // We initialize a hidden cart so it's ready to slide out
  uiInstance.createComponent('cart', {
    options: {
      cart: {
        styles: {
          button: {
            'background-color': '#d17a41', // Copper brand color
            ':hover': { 'background-color': '#a55d31' }
          }
        }
      }
    }
  }).then((cart: any) => {
    cartInstance = cart;
  });
};

export const addProductToCart = (variantId: string, quantity: number = 1) => {
  if (!cartInstance) {
    alert("Shopify Cart is not configured yet. Please check back later!");
    return;
  }
  
  cartInstance.model.addVariants({ variant: { id: variantId }, quantity }).then(() => {
    cartInstance.open();
  });
};

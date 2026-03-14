import { Coins } from "./types";

export const formatPrice = (price: { gold: number; silver: number; copper: number }) => {
  const parts = [];
  if (price.gold > 0) parts.push(`${price.gold}g`);
  if (price.silver > 0) parts.push(`${price.silver}s`);
  if (price.copper > 0) parts.push(`${price.copper}c`);
  return parts.join(' ');
};

export function canBuyItem(coins: Coins, price: Coins): boolean {
  const totalCopper = coins.copper + coins.silver * 10 + coins.gold * 100;
  const priceCopper = price.copper + price.silver * 10 + price.gold * 100;
  return totalCopper >= priceCopper;
}

export function applyPriceToCoins(coins: Coins, price: Coins): Coins {
  let totalCopper = coins.copper + coins.silver * 10 + coins.gold * 100;
  const priceCopper = price.copper + price.silver * 10 + price.gold * 100;

  if (totalCopper < priceCopper) {
    throw new Error("Not enough coins to complete the transaction");
  }

  totalCopper -= priceCopper;

  return {
    gold: Math.floor(totalCopper / 100),
    silver: Math.floor((totalCopper % 100) / 10),
    copper: totalCopper % 10
  };
}

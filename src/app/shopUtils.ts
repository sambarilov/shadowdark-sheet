import { Coins } from "./types";

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

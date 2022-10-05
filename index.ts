import fetch from 'node-fetch';
import { schedule } from 'node-cron';
import notifier from 'node-notifier';
const { notify } = notifier;

enum iPhone14ProMax {
    ClassicForTest = 'MPWP3ZD/A',
    Purple256 = 'MQ9X3ZD/A',
    Black1To = 'MQC23ZD/A',
}

const findProducts: string[] = [iPhone14ProMax.ClassicForTest];

getAvailableProducts();
schedule('*/5 * * * *', async () => {
    return getAvailableProducts();
});

async function getAvailableProducts() {
    for (const product of findProducts) {
        const request = await fetch(
            `https://www.apple.com/fr/shop/fulfillment-messages?searchNearby=true&store=R277&parts.0=${product}`
        );
        if (!request.ok) return console.error('Request failed', await request.text());

        const response: any = await request.json();
        const stores = response.body.content.pickupMessage.stores;
        for (const store of stores) {
            if (!store.partsAvailability[product].messageTypes.regular.storeSelectionEnabled) continue;
            console.log(
                `Produit disponible - ${store.storeName} - ${store.partsAvailability[product].messageTypes.regular.storePickupProductTitle}`
            );

            notify({
                title: 'iPhone 14 Pro Max dispo !',
                message: `${store.partsAvailability[product].messageTypes.regular.storePickupProductTitle} disponible à l'Apple Store ${store.storeName} !`,
                sound: true,
            });
        }
    }
}

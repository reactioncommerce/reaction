export default async function noopTriggerHandler(context, cart, trigger) {
    console.log('noopTriggerHandler called')
    return false
}
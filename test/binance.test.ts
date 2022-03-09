import { validateAddress } from "../src/services/binance.service";
import {testAddress} from '../mocks/index'
describe('binance tests', () => {
    for (let address in testAddress) {
        test('can identify network of coin', () => {
            expect(validateAddress(testAddress[address])).toBe(address)
        })
    }
    test('can identify invalid address', () => {
        expect(validateAddress('randomstring')).toBeFalsy()
    })
})

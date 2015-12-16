﻿import ArrayConverter = require('./ArrayConverter');
import BooleanConverter = require('./BooleanConverter');
import NumberConverter = require('./NumberConverter');
import StringConverter = require('./StringConverter');
import TypeConverter = require('./TypeConverter');

var keyToConverterList: { [index: string]: TypeConverter } = {};
var nameToKeyList: { [index: string]: string } = {};
var converterArray: TypeConverter[] = [new StringConverter('0'), new BooleanConverter('1'), new NumberConverter('2')];
for (var i = 0; i < converterArray.length; i++) {
    var converter = converterArray[i];
    var arrayConverter = new ArrayConverter(converter, 'a' + converter.key)
    keyToConverterList[converter.key] = converter;
    keyToConverterList[arrayConverter.key] = arrayConverter;
    nameToKeyList[converter.name] = converter.key;
    nameToKeyList[arrayConverter.name] = arrayConverter.key;
}

class ConverterFactory {
    static getConverter(obj: any) {
        return this.getConverterFromName(TypeConverter.getName(obj));
    }

    static getConverterFromKey(key: string): TypeConverter {
        return keyToConverterList[key];
    }
    
    static getConverterFromName(name: string): TypeConverter {
        var key = nameToKeyList[name];
        if (!key)
            throw new Error('No TypeConverter found for ' + name);
        return this.getConverterFromKey(key);
    }
}
export = ConverterFactory;
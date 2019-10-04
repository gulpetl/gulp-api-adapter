import targetCsv from '../src/plugin';
const from = require('from2');
const Vinyl = require('vinyl');


describe('plugin tests', () => {

    test('Works with Vinyl file as Buffer', (done) => {
        let fakeFile = new Vinyl({
            path:"cars.csv",
            contents: Buffer.from('carModel,price,color\n"Audi",10000,"blue"\n"BMW",15000,"red"')
        })

        from.obj([fakeFile]).pipe(targetCsv({}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isBuffer()).toBeTruthy()
                expect(file.contents.toString()).toBe('{"type":"RECORD","stream":"cars","record":{"carModel":"Audi","price":"10000","color":"blue"}}\n{"type":"RECORD","stream":"cars","record":{"carModel":"BMW","price":"15000","color":"red"}}')
                done();
            })
    });
    test('Works with Vinyl file as Buffer with debug option (info)', (done) => {
        let fakeFile = new Vinyl({
            path:"cars.csv",
            contents: Buffer.from('carModel,price,color\n"Audi",10000,"blue"\n"BMW",15000,"red"')
        })

        from.obj([fakeFile]).pipe(targetCsv({info:true}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isBuffer()).toBeTruthy()
                expect(file.contents.toString()).toBe('{"type":"RECORD","stream":"cars","record":{"carModel":"Audi","price":"10000","color":"blue"},"info":{"comment_lines":0,"empty_lines":0,"invalid_field_length":0,"lines":2,"records":0}}\n{"type":"RECORD","stream":"cars","record":{"carModel":"BMW","price":"15000","color":"red"},"info":{"comment_lines":0,"empty_lines":0,"invalid_field_length":0,"lines":3,"records":1}}')
                done();
            })
    });
    
    test('Works with Vinyl file as Buffer - empty file', (done) => {
        let fakeFile = new Vinyl({
            path:"cars.csv",
            contents: Buffer.from('')
        })
        from.obj([fakeFile]).pipe(targetCsv({}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isBuffer()).toBeTruthy()
                expect(file.contents.toString()).toBe('')
                done();
            })
    });

    test('Works with Vinyl file as Stream', (done) => {
        let fakeFile = new Vinyl({
            path:"cars.csv",
            contents: from(['carModel,price,color\n"Audi",10000,"blue"\n"BMW",15000,"red"'])
        })
        let result: string = '';
        from.obj([fakeFile]).pipe(targetCsv({}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isStream()).toBeTruthy()
                file.contents.on('data', function (chunk: any) {
                    result += chunk;
                })
                file.contents.on('end', function(){
                    expect(result).toBe('{"type":"RECORD","stream":"cars","record":{"carModel":"Audi","price":"10000","color":"blue"}}\n{"type":"RECORD","stream":"cars","record":{"carModel":"BMW","price":"15000","color":"red"}}\n')
                    done();
                })
            })
    });
    test('Works with Vinyl file as Stream using debug option (raw)', (done) => {
        let fakeFile = new Vinyl({
            path:"cars.csv",
            contents: from(['carModel,price,color\n"Audi",10000,"blue"\n"BMW",15000,"red"'])
        })
        let result: string = '';
        from.obj([fakeFile]).pipe(targetCsv({raw:true}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isStream()).toBeTruthy()
                file.contents.on('data', function (chunk: any) {
                    result += chunk;
                })
                file.contents.on('end', function(){
                    expect(result).toBe('{"type":"RECORD","stream":"cars","record":{"carModel":"Audi","price":"10000","color":"blue"},"raw":"\\\"Audi\\\",10000,\\\"blue\\\"\\n"}\n{"type":"RECORD","stream":"cars","record":{"carModel":"BMW","price":"15000","color":"red"},"raw":"\\\"BMW\\\",15000,\\\"red\\\""}\n')
                    done();
                })
            })
    });
    test('Works with Vinyl file as Stream - empty file', (done) => {
        let fakeFile = new Vinyl({
            path:"cars.csv",
            contents: from([''])
        })
        let result: string = '';
        from.obj([fakeFile]).pipe(targetCsv({}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isStream()).toBeTruthy()
                file.contents.on('data', function (chunk: any) {
                    result += chunk;
                })
                file.contents.on('end', function(){
                    expect(result).toBe('')
                    done();
                })
            })
    });
});
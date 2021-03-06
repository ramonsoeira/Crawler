const express = require('express');
const app = express();
const mustache = require('mustache-express');
app.engine('html',mustache());

app.set('view engine', 'html');
app.set('views', './views');
app.use(express.static(__dirname+"assets"));

var fs = require('fs');
var Crawler = require('./indexCheckObjetivo');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res) => {
    res.render('index')
})

app.get('/getLog', (req,res) => {
    try{
        fs.access('ObjetosLog.txt', fs.F_OK, (err) =>{
            if(err){
                console.log("Não existe o arquivo");
                return;
            }

            fs.readFile('ObjetosLog.txt', 'utf8', function(err, data) {
                if (err) throw err;
                    data = data.substring(0, data.length - 2);
                    var dt = JSON.parse("[" + data + "]");
                    res.send(dt);
            });
        });
    }catch(e){
        res.send("Erro ao pegar Log!");
    }
})

app.get('/getLinks', (req,res) => {
    try{
        fs.access('LogLinksNew.txt', fs.F_OK, (err) =>{
            if(err){
                console.log("Não existe o arquivo");
                return;
            }

            fs.readFile('LogLinksNew.txt', 'utf8', function(err, data) {
                if (err) throw err;
                    data = data.substring(0, data.length - 3);
                    var dt = JSON.parse("[" + data + "]");
                    res.send(dt);
            });
        });
    }catch(e){
        res.send("Erro ao pegar Log!");
    }
})

app.post('/startCrawler/', async(req,res) => {
    try{
        for(let i=0;i<req.body.simultaneos; i++){
            await delay(2500);
            Crawler.Crawler(req.body.MostrarBrowser,req.body.baseUrl,req.body.palavrasChave,req.body.repetirUrl,req.body.excecoes,{ConsoleError: req.body.ConsoleError, Printscreen: req.body.Printscreen, ObterLinks: req.body.ObterLinks, BuscarNaPagina: req.body.BuscarNaPagina}, req.body.PalavraBusca);
        }
        await delay(1000);
        res.send(Crawler.Running());
        
    }catch(err){
        console.log(err);
        res.send('Erro ao iniciar Crawler');
    }
});

app.get('/statusCrawler/', (req,res) => {
    try{
        res.send(Crawler.Running());
    }catch(err){
        console.log(err);
    }
});

app.post('/stopCrawler/', (req,res) => {
    try{
        Crawler.ParaCrawler(req.body.instancia);
    }catch(err){
        console.log(err);
    }
    res.send("Parado com sucesso!");
});

app.post('/deleteCrawler/', (req,res) => {
    try{
        Crawler.ParaCrawler(req.body.instancia)
        Crawler.LimpaInstancia(req.body.instancia);
    }catch(err){
        console.log(err);
    }
    res.send("Deletado com sucesso!");
});

app.post('/pausarCrawler/', (req,res) => {
    try{
        Crawler.PausarCrawler(req.body.instancia);
    }catch(err){
        console.log(err);
    }
    res.send("Pausado com sucesso!");
});

app.post('/continuarCrawler/', (req,res) => {
    try{
        Crawler.ContinuarCrawler(req.body.instancia);
    }catch(err){
        console.log(err);
    }
    res.send("Pausado com sucesso!");
});

app.post('/alterarInstancia', (req,res) => {
    try{
        Crawler.AlterarInstancia(req.body.instancia,req.body.ConsoleError,req.body.Printscreen,req.body.ObterLinks,req.body.ObterLinksRepetidos,req.body.InstanciaNova);
    }catch(err){
        console.log(err);
    }
    res.send("Pausado com sucesso!");
});

app.post('/getConsoleError', (req,res) => {
    try{
        fs.access('ObjetosLog.txt', fs.F_OK, (err) =>{
            if(err){
                console.log("Não existe o arquivo");
                return;
            }

            fs.readFile('ObjetosLog.txt', 'utf8', function(err, data) {
                if (err) throw err;
                    data = data.substring(0, data.length - 2);
                    var dt = JSON.parse("[" + data + "]");
                    let newData = [];
                    dt.forEach(e=>e.instancia == req.body.InstanciaResponsavel ? newData.push(e) : "");
                    res.send(newData);
            });
        });
    }catch(e){
        res.send("Erro ao pegar Log!");
    }
})

app.post('/getLinksInstancia', (req,res) => {
    try{
        fs.access('LogLinksNew.txt', fs.F_OK, (err) =>{
            if(err){
                console.log("Não existe o arquivo");
                return;
            }

            fs.readFile('LogLinksNew.txt', 'utf8', function(err, data) {
                if (err) throw err;
                    data = data.substring(0, data.length - 3);
                    var dt = JSON.parse("[" + data + "]");
                    let newData = [];
                    dt.forEach(e=>e.Instancia == req.body.InstanciaResponsavel ? newData.push(e) : "");
                    res.send(newData);
            });
        });
    }catch(e){
        res.send("Erro ao pegar Log!");
    }
})

app.post('/pegarUrlsAcessadas/', (req,res) => {
    try{
        res.send(Crawler.PegarUrlsAcessadas(req.body.instancia));
    }catch(err){
        console.log(err);
    }
});

app.post('/pegarUrlsRestante/', (req,res) => {
    try{
        res.send(Crawler.PegarUrlsRestante(req.body.instancia));
    }catch(err){
        console.log(err);
    }
});

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

app.listen(3000, () => console.log("Listening on port 3000"));
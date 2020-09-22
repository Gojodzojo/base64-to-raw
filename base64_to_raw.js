const express = require("express")

const port = process.env.PORT || 3000
const app = express()
app.use(express.json({limit: "10mb"}))

app.listen(port, () => {
    console.log(`Nasłuchiwanie portu ${port}`)
})

const newID = () => Math.random().toString(36).substr(2, 9)
const files = {}

app.post("/", (req, res) => {
    const ID = newID()    
    try {
        const baseParts = req.body.base64.split(",")
        let contentType, baseString
        if(baseParts.length == 1) {
            contentType = "plain/text"
            baseString = baseParts[0]
        }
        else {
            contentType = baseParts[0].split( /:(.*?);/ )[1]
            baseString = baseParts[1]
        }
        const buffer = Buffer.from(baseString, "base64")
        files[ID] = {contentType, buffer}
    }
    catch(err) {
        console.log(err)
        res.json({error: "Wrong base64 string"})
        return
    }    
    res.json({ID})
}) 

app.get("/:ID", (req, res) => {
    const {ID} = req.params
    if(files[ID] === undefined) {
        res.json({error: "Wrong ID"})
        return
    }
    const {contentType, buffer} = files[ID]        
    res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': buffer.length
    })   
    res.end(buffer)    
    delete files[ID]
})
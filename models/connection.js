var mongoose = require('mongoose')

var options = {
    connectTimeoutMS: 5000,
    useUnifiedTopology: true,
    useNewUrlParser: true,
}

mongoose.connect('mongodb+srv://blackboard:KRsEro8HYOIzopFX@cluster.dq2na.mongodb.net/blackboard',
    options,
    function(err){
        console.log(err);
    }
)

module.exports = mongoose
const feedbackService = require('../services/feedbackService');

exports.addFeedback = async (req,res)=>{
    try{
        const userId = req.user.userId;
        const {shopId} = req.params;
        const {voto, commento} = req.body;

        if(!voto || voto<1 || voto>5){
            return res.status(400).json({
                success: false,
                message: "Il voto deve essere compres tra 1 e 5"
            });
        }
        const feedback = await feedbackService.addFeedback(userId, shopId, {voto, commento});

        res.status(201).json({
            success: true,
            message: "Feedback aggiunto con successo",
            data: feedback
        });
    }catch (err){
        if(err.message === "Shop not found"){
            return res.status(404).json({ success: false, message: err.message});
        }
        if(err.message === "User not found"){
            return res.status(404).json({success: false, message: err.message});
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};
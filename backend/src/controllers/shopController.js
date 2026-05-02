
exports.registerShop = async (req, res, next) => {
    try {
        res.status(201).json({ message: 'Shop registered' });
    } catch (err) {
        next(err);
    }
}
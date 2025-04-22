exports.ok = async (req, res) => {
    res.status(200).json({ status: 'UP!' });
};
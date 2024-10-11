// middleware/checkRole.js
const User = require('../models/User');
const Competition = require('../models/Competition');

const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { username } = req.user; 
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const competition = await Competition.findById(req.params.id);
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }

      const isLeadJudge = competition.judges.leadJudge && competition.judges.leadJudge.equals(user._id);
      const isJudge = competition.judges.judges.some(judge => judge.equals(user._id));

      if (requiredRole === 'judge' && (isLeadJudge || isJudge)) {
        req.user = user; 
        next();
      } else if (requiredRole === 'leadJudge' && isLeadJudge) {
        req.user = user; 
        next();
      } else {
        res.status(403).json({ message: 'Access denied' });
      }
    } catch (error) {
      console.error('Error in checkRole middleware:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

module.exports = checkRole;

const bcrypt = require('bcryptjs');
const hash = '$2b$10$O9yDicpWxSH3EDyCF6ahB.XNQV14zGotSSayhlow4.slwK93kjsV6';
console.log('Compare:', bcrypt.compareSync('123456', hash));

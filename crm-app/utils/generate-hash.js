const bcrypt = require('bcryptjs');

async function vygeneruj() {
    const heslo = "DAJ_SEM_HESLO";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(heslo, salt);
    
    console.log("Tvoj hash pre databázu:");
    console.log(hash);
}

vygeneruj();
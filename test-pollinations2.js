const https = require('https');

const url = 'https://pollinations.ai/p/Hyperrealistic%20interior%20design%20renovation%2C%20floor%20transformed%20into%20resina%20epoxica%20flores%20High%20Gloss%20Epoxy%20Resin%2C%20perfect%20mirror%20reflection%2C%20luxury%20finish%2C%20preserving%20original%20room%20geometry%2C%208k%20architectural%20photography%2C%20bright%20lighting.jpg?width=1024&height=1024&seed=159444&model=flux-realism&nologo=true&enhance=false&image=https%3A%2F%2Ftdrkkpddtnzskpdauoig.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fuploads%2Fuploads%2F1771961413038_p2mzp.jpg&strength=0.45';

https.get(url, (res) => {
    res.on('data', chunk => {
        console.log(chunk.toString().substring(0, 500));
    });
}).on('error', (e) => {
    console.error(e);
});

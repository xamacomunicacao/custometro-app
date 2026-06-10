async function testWP() {
   try {
       const res = await fetch('https://www.aleam.gov.br/wp-json/wp/v2/pages?search=deputados');
       if (res.ok) {
           const json = await res.json();
           console.log("Pages found:", json.length);
       } else {
           console.log("REST API não acessivel:", res.status);
       }
   } catch(e) { console.error(e); }
}
testWP();

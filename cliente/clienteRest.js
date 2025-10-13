function ClienteRest(){
this.agregarUsuario=function(nick){
var cli=this;
$.getJSON("/agregarUsuario/"+nick,function(data){
if (data.nick!=-1){
console.log("Usuario "+nick+" ha sido registrado")
}
else{
console.log("El nick ya está ocupado");
}
})
}
}


'use strict';
const form=document.querySelector('#contact-form'),summary=document.querySelector('#form-errors'),success=document.querySelector('#success-panel');
const fields=[...form.querySelectorAll('[required]')];let attempted=false;
function errorFor(f){
 if(f.type==='checkbox')return f.checked?'':'Bitte die Einwilligung bestätigen.';
 if(!f.value.trim())return f.tagName==='SELECT'?'Bitte eine Anfrageart auswählen.':'Bitte dieses Feld ausfüllen.';
 if(f.type==='email'&&f.validity.typeMismatch)return 'Bitte eine gültige E-Mail-Adresse eintragen.';
 if(f.id==='message'&&f.value.trim().length<10)return 'Bitte mindestens 10 Zeichen schreiben.';
 return '';
}
function validate(f){const error=errorFor(f);f.setAttribute('aria-invalid',String(Boolean(error)));document.getElementById(f.id+'-error').textContent=error;return !error;}
for(const f of fields){f.addEventListener('blur',()=>{if(f.value||attempted)validate(f);});f.addEventListener('input',()=>{if(attempted||f.getAttribute('aria-invalid')==='true'){validate(f);if(fields.every(x=>!errorFor(x)))summary.hidden=true;}});}
form.addEventListener('submit',e=>{e.preventDefault();attempted=true;const valid=fields.map(validate);if(valid.includes(false)){summary.hidden=false;summary.textContent='Noch nicht ganz: Bitte prüfe die markierten Felder.';fields[valid.indexOf(false)].focus();return;}summary.hidden=true;form.hidden=true;success.hidden=false;success.focus({preventScroll:true});});
document.querySelector('#form-reset').addEventListener('click',()=>{form.reset();attempted=false;fields.forEach(f=>{f.removeAttribute('aria-invalid');document.getElementById(f.id+'-error').textContent='';});success.hidden=true;form.hidden=false;document.querySelector('#kind').focus();});

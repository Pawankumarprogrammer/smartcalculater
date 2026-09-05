const $ = id => document.getElementById(id);

document.querySelectorAll(".nav-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active-panel"));
    btn.classList.add("active");
    $(btn.dataset.target).classList.add("active-panel");
  });
});

$("themeBtn").addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  $("themeBtn").textContent=document.body.classList.contains("dark")?"☀️":"🌙";
});

// Basic calculator
let expression="";
function updateDisplay(){ $("display").value=expression || "0"; }
document.querySelectorAll(".key[data-value]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const v=btn.dataset.value;
    if(v==="%" && expression) expression += "/100";
    else expression += v;
    updateDisplay();
  });
});
$("basic").querySelector('[data-action="clear"]').addEventListener("click",()=>{expression="";updateDisplay()});
$("basic").querySelector('[data-action="backspace"]').addEventListener("click",()=>{expression=expression.slice(0,-1);updateDisplay()});
$("basic").querySelector('[data-action="equals"]').addEventListener("click",()=>{
  try{
    if(!expression) return;
    if(!/^[0-9+\-*/%.() ]+$/.test(expression)) throw Error();
    const value=Function('"use strict";return ('+expression+')')();
    if(!Number.isFinite(value)) throw Error();
    expression=String(Math.round(value*1e12)/1e12);
    updateDisplay();
  }catch{expression="Error";updateDisplay();setTimeout(()=>{expression="";updateDisplay()},900)}
});

// Simple interest
$("siBtn").addEventListener("click",()=>{
  const p=+$("siPrincipal").value,r=+$("siRate").value,t=+$("siTime").value;
  if([p,r,t].some(x=>x<0 || !Number.isFinite(x))) return $("siResult").textContent="Please enter valid values.";
  const si=p*r*t/100, total=p+si;
  $("siResult").innerHTML=`Simple Interest: <strong>${si.toFixed(2)}</strong><br>Total Amount: <strong>${total.toFixed(2)}</strong>`;
});

// Compound interest
$("ciBtn").addEventListener("click",()=>{
  const p=+$("ciPrincipal").value,r=+$("ciRate").value,t=+$("ciTime").value,n=+$("ciFrequency").value;
  if([p,r,t,n].some(x=>x<0 || !Number.isFinite(x)) || n===0) return $("ciResult").textContent="Please enter valid values.";
  const amount=p*Math.pow(1+(r/100)/n,n*t), interest=amount-p;
  $("ciResult").innerHTML=`Compound Interest: <strong>${interest.toFixed(2)}</strong><br>Total Amount: <strong>${amount.toFixed(2)}</strong>`;
});

// Age calculator
function setToday(){
  const d=new Date();
  $("ageAsOf").value=d.toISOString().slice(0,10);
}
setToday();

$("ageBtn").addEventListener("click",()=>{
  const dob=new Date($("dob").value+"T00:00:00");
  const asOf=new Date($("ageAsOf").value+"T00:00:00");
  if(isNaN(dob)||isNaN(asOf)||dob>asOf) return $("ageResult").textContent="Please choose a valid date of birth and date.";
  let y=asOf.getFullYear()-dob.getFullYear();
  let m=asOf.getMonth()-dob.getMonth();
  let d=asOf.getDate()-dob.getDate();
  if(d<0){m--; d+=new Date(asOf.getFullYear(),asOf.getMonth(),0).getDate()}
  if(m<0){y--;m+=12}
  const next=new Date(asOf.getFullYear(),dob.getMonth(),dob.getDate());
  if(next<=asOf) next.setFullYear(asOf.getFullYear()+1);
  const days=Math.ceil((next-asOf)/86400000);
  $("ageResult").innerHTML=`Age: <strong>${y} years, ${m} months, ${d} days</strong><br>Next birthday: <strong>${days} day(s)</strong> from the selected date.`;
});

// Currency calculator
const fallbackRates={
  USD:{USD:1,INR:88.0,EUR:.85,GBP:.73,JPY:148,AUD:1.52,CAD:1.38},
  INR:{USD:1/88,INR:1,EUR:.85/88,GBP:.73/88,JPY:148/88,AUD:1.52/88,CAD:1.38/88},
  EUR:{USD:1/.85,INR:88/.85,EUR:1,GBP:.73/.85,JPY:148/.85,AUD:1.52/.85,CAD:1.38/.85},
  GBP:{USD:1/.73,INR:88/.73,EUR:.85/.73,GBP:1,JPY:148/.73,AUD:1.52/.73,CAD:1.38/.73},
  JPY:{USD:1/148,INR:88/148,EUR:.85/148,GBP:.73/148,JPY:1,AUD:1.52/148,CAD:1.38/148},
  AUD:{USD:1/1.52,INR:88/1.52,EUR:.85/1.52,GBP:.73/1.52,JPY:148/1.52,AUD:1,CAD:1.38/1.52},
  CAD:{USD:1/1.38,INR:88/1.38,EUR:.85/1.38,GBP:.73/1.38,JPY:148/1.38,AUD:1.52/1.38,CAD:1}
};

$("swapCurrency").addEventListener("click",()=>{
  const a=$("fromCurrency").value,b=$("toCurrency").value;
  $("fromCurrency").value=b;$("toCurrency").value=a;
});

$("convertBtn").addEventListener("click",async()=>{
  const amount=+$("currencyAmount").value, from=$("fromCurrency").value, to=$("toCurrency").value;
  if(amount<0 || !Number.isFinite(amount)) return $("currencyResult").textContent="Please enter a valid amount.";
  if(from===to){$("currencyResult").innerHTML=`Result: <strong>${amount.toFixed(2)} ${to}</strong>`;return}
  $("currencyResult").textContent="Fetching current rate...";
  try{
    const res=await fetch(`https://open.er-api.com/v6/latest/${from}`);
    if(!res.ok) throw Error();
    const data=await res.json();
    const rate=data.rates[to];
    if(!rate) throw Error();
    $("currencyResult").innerHTML=`<strong>${amount.toFixed(2)} ${from}</strong> = <strong>${(amount*rate).toFixed(2)} ${to}</strong><br><small>Rate: 1 ${from} = ${rate.toFixed(6)} ${to}</small>`;
  }catch{
    const rate=fallbackRates[from][to];
    $("currencyResult").innerHTML=`<strong>${amount.toFixed(2)} ${from}</strong> ≈ <strong>${(amount*rate).toFixed(2)} ${to}</strong><br><small>Offline fallback rate used. Connect to the internet for an updated rate.</small>`;
  }
});

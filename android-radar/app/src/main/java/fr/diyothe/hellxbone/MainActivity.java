package fr.diyothe.hellxbone;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
 private WebView web; private Button toggle; private TextView hint;
 private static final String HOME="https://hellxbone.github.io/HELLXBONE-DIYOTHE-/";
 private static final int GPS=66;
 @Override public void onCreate(Bundle state){super.onCreate(state);
  LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setBackgroundColor(Color.BLACK);
  toggle=new Button(this);toggle.setAllCaps(false);toggle.setOnClickListener(v->toggleRadar());
  hint=new TextView(this);hint.setTextColor(Color.LTGRAY);hint.setPadding(15,2,15,8);hint.setTextSize(12);
  web=new WebView(this);web.getSettings().setJavaScriptEnabled(true);web.getSettings().setDomStorageEnabled(true);
  web.setWebViewClient(new WebViewClient(){@Override public void onPageFinished(WebView v,String url){updateUi();}});
  root.addView(toggle);root.addView(hint);
  root.addView(web,new LinearLayout.LayoutParams(-1,0,1));setContentView(root);updateUi();web.loadUrl(HOME);
 }
 private boolean enabled(){return getSharedPreferences("radar",MODE_PRIVATE).getBoolean("enabled",false);}
 private void updateUi(){toggle.setText(enabled()?"ARRÊTER MA PRÉSENCE RADAR":"ACTIVER MA PRÉSENCE RADAR");
  hint.setText(enabled()?"Radar natif actif : présence envoyée avec une notification permanente. Arrêt possible ici ou depuis la notification.":"Radar inactif : appuie ici pour participer, après autorisation GPS. Le mode natif fonctionne écran éteint.");}
 private void toggleRadar(){
  if(enabled()){startService(new Intent(this,RadarService.class).setAction(RadarService.STOP));getSharedPreferences("radar",MODE_PRIVATE).edit().putBoolean("enabled",false).apply();updateUi();return;}
  if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED &&
     checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)!=PackageManager.PERMISSION_GRANTED){
   requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},GPS);return;
  }
  startWithMember();
 }
 @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] results){super.onRequestPermissionsResult(code,permissions,results);
  if(code==GPS && (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED||
   checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)==PackageManager.PERMISSION_GRANTED))startWithMember();
 }
 private void startWithMember(){
  if(web.getUrl()==null || !web.getUrl().startsWith(HOME)){hint.setText("Ouvre d’abord HELLXBONE et inscris ton pseudo.");return;}
  web.evaluateJavascript("(function(){return localStorage.getItem('hellx-club-device-v1')||''})()",json->{
   String member=json==null?"":json.replace("\\\"","").trim();
   if(!member.matches("[0-9a-fA-F-]{36}")){hint.setText("Connecte ton pseudo HELLXBONE, puis active le radar.");return;}
   getSharedPreferences("radar",MODE_PRIVATE).edit().putBoolean("enabled",true).apply();
   Intent intent=new Intent(this,RadarService.class);intent.putExtra("member_id",member);
   try{startForegroundService(intent);}catch(Exception e){getSharedPreferences("radar",MODE_PRIVATE).edit().putBoolean("enabled",false).apply();hint.setText("Impossible de lancer le suivi : "+e.getMessage());}
   updateUi();
  });
 }
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override public void onDestroy(){web.destroy();super.onDestroy();}
}
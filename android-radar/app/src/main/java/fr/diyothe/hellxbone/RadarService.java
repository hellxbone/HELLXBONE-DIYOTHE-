package fr.diyothe.hellxbone;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.location.*;
import android.os.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.*;

public class RadarService extends Service {
 private static final String CHANNEL="hellx_radar_location";
 private static final String BASE="https://ldibykpitjutratyqqax.supabase.co/rest/v1/rpc/";
 private static final String KEY="sb_publishable_YIL89sE8bNs9jQ_az-ClkA_Wq-80zKv";
 public static final String STOP="fr.diyothe.hellxbone.STOP";
 private final Handler handler=new Handler(Looper.getMainLooper());
 private final ExecutorService worker=Executors.newSingleThreadExecutor();
 private LocationManager locationManager; private String member;
 private LocationListener listener;
 @Override public IBinder onBind(Intent i){return null;}
 @Override public int onStartCommand(Intent i,int flags,int startId){
  if(i!=null && STOP.equals(i.getAction())){stop();return START_NOT_STICKY;}
  member=i==null?null:i.getStringExtra("member_id");
  if(member==null || !member.matches("[0-9a-fA-F-]{36}")){stopSelf();return START_NOT_STICKY;}
  if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED &&
      checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)!=PackageManager.PERMISSION_GRANTED){stop();return START_NOT_STICKY;}
  NotificationManager manager=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);
  manager.createNotificationChannel(new NotificationChannel(CHANNEL,"Présence radar HELLXBONE",NotificationManager.IMPORTANCE_LOW));
  Intent stopIntent=new Intent(this,RadarService.class).setAction(STOP);
  PendingIntent stopAction=PendingIntent.getService(this,0,stopIntent,PendingIntent.FLAG_IMMUTABLE|PendingIntent.FLAG_UPDATE_CURRENT);
  Notification note=new Notification.Builder(this,CHANNEL).setSmallIcon(android.R.drawable.ic_menu_mylocation)
    .setContentTitle("HELLXBONE — radar actif").setContentText("Ta présence est signalée aux métalleux proches.")
    .setOngoing(true).addAction(new Notification.Action.Builder(null,"Devenir invisible",stopAction).build()).build();
  startForeground(666,note);
  locationManager=(LocationManager)getSystemService(LOCATION_SERVICE);
  if(listener!=null)locationManager.removeUpdates(listener);
  listener=new LocationListener(){@Override public void onLocationChanged(Location loc){send(loc);}};
  try{
   String provider=locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)?LocationManager.NETWORK_PROVIDER:LocationManager.GPS_PROVIDER;
   locationManager.requestLocationUpdates(provider,45000,50f,listener,Looper.getMainLooper());
   Location last=locationManager.getLastKnownLocation(provider);
   if(last!=null && System.currentTimeMillis()-last.getTime()<120000)send(last);
  }catch(SecurityException|IllegalArgumentException e){stop();}
  return START_NOT_STICKY;
 }
 private void send(Location loc){
  if(member==null)return;
  final String id=member;
  final String payload="{\"p_member_id\":\""+id+"\",\"p_latitude\":"+loc.getLatitude()+",\"p_longitude\":"+loc.getLongitude()+"}";
  worker.execute(()->request("hellx_radar_ping",payload));
 }
 private void request(String path,String payload){
  HttpURLConnection conn=null;
  try{
   conn=(HttpURLConnection)new URL(BASE+path).openConnection();
   conn.setRequestMethod("POST");conn.setConnectTimeout(12000);conn.setReadTimeout(12000);conn.setDoOutput(true);
   conn.setRequestProperty("apikey",KEY);conn.setRequestProperty("Content-Type","application/json");
   try(OutputStream out=conn.getOutputStream()){out.write(payload.getBytes(StandardCharsets.UTF_8));}
   try(InputStream response=(conn.getResponseCode()<400?conn.getInputStream():conn.getErrorStream())){if(response!=null){byte[] buf=new byte[256];while(response.read(buf)!=-1){} }}
  }catch(Exception ignored){}finally{if(conn!=null)conn.disconnect();}
 }
 private void stop(){
  String id=member;
  if(id!=null)worker.execute(()->request("hellx_radar_off","{\"p_member_id\":\""+id+"\"}"));
  getSharedPreferences("radar",MODE_PRIVATE).edit().putBoolean("enabled",false).apply();
  stopForeground(STOP_FOREGROUND_REMOVE);stopSelf();
 }
 @Override public void onDestroy(){if(locationManager!=null&&listener!=null)locationManager.removeUpdates(listener);worker.shutdown();super.onDestroy();}
}
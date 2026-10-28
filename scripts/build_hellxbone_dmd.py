import os, math, subprocess
import numpy as np, cv2
W,H,FPS,N=320,132,18,24
Y,X=np.mgrid[:H,:W]
def line(im,a,b,col=(85,190,112),w=1):
 cv2.line(im,tuple(map(int,a)),tuple(map(int,b)),col,w,cv2.LINE_AA)
def poly(im,points,col):
 cv2.fillPoly(im,[np.asarray(points,np.int32)],col,cv2.LINE_AA)
def skull(im,x,y,s):
 cv2.ellipse(im,(int(x),int(y)),(int(8*s),int(11*s)),0,0,360,(65,170,95),-1)
 for dx in (-3,3):cv2.circle(im,(int(x+dx*s),int(y-2*s)),max(1,int(2*s)),(0,9,2),-1)
def frame(t):
 im=np.zeros((H,W,3),np.uint8)
 glow=8+45*np.exp(-((X-210)**2/43000+(Y-29)**2/12000))
 im[:,:,1]=glow.astype('uint8');im[:,:,0]=(glow*.27).astype('uint8');im[:,:,2]=(glow*.46).astype('uint8')
 if t<9:
  sway=math.sin(t*2.4)*19+math.sin(t*4.2)*8;h=26
  poly(im,[(159+sway,h),(163+sway,h),(303,H),(12,H)],(11,34,18))
  for i in range(27):
   d=((i/27+t*.44)%1);y=h+d*d*150;s=.3+d*1.8
   for side in (-1,1):
    x=160+sway+side*(15+d*d*125)+math.sin(i*11)*7
    poly(im,[(x-6*s,y),(x-6*s,y-12*s),(x-3*s,y-17*s),(x+4*s,y-17*s),(x+6*s,y-12*s),(x+6*s,y)],(38+int(24*d),90+int(75*d),51+int(35*d)))
    line(im,(x+7*s,y),(x+10*s,y-13*s),(20,50,25))
  cv2.circle(im,(264,22),10,(68,178,109),-1,cv2.LINE_AA)
  if t>5:
   a=min(1,(t-5)*.8,(9-t)*.9);s=.7+a*1.1;x=160+math.sin(t*1.7)*13;y=71
   cv2.ellipse(im,(int(x),int(y+14*s)),(int(28*s),int(35*s)),0,0,360,(37,115,61),-1)
   skull(im,x,y-18*s,2*s)
   for side in (-1,1):
    poly(im,[(x+side*12*s,y-28*s),(x+side*27*s,y-62*s),(x+side*30*s,y-73*s),(x+side*16*s,y-54*s),(x+side*5*s,y-31*s)],(80,173,105))
    cv2.circle(im,(int(x+side*8*s),int(y-20*s)),max(1,int(3*s)),(150,255,170),-1)
 elif t<15:
  u=t-9;poly(im,[(21,65),(299,65),(318,101),(0,101)],(19,65,33))
  line(im,(21,65),(299,65))
  cv2.circle(im,(160,62),18,(45,125,68),-1)
  cv2.circle(im,(160,62),12,(1,14,5),-1)
  for j,x in enumerate((70,127,226)):
   y=35+math.sin(u*8+j)*3
   cv2.circle(im,(x,int(y)),8,(69,154,86),-1)
   poly(im,[(x-11,y+10),(x+10,y+10),(x+12,71),(x-12,71)],(40,113,63))
   line(im,(x-5,70),(x-15,93),(74,173,90),4)
   line(im,(x+5,70),(x+13,93),(74,173,90),4)
   if j!=1:
    poly(im,[(x-15,55),(x,49),(x+17,61),(x,72)],(88,207,110))
    line(im,(x+3,52),(x+39,32),(137,231,149),3)
  for i in range(51):
   x=i*37%W;y=97+(i*17%28)+math.sin(u*7+i)*4
   cv2.circle(im,(x,int(y)),5,(25,83+i%4*15,45),-1)
   if i%4==0:line(im,(x,y),(x+8,y-16+math.sin(u*8+i)*4),(68,171,95),3)
  overlay=im.copy()
  for j in range(4):
   sx=34+j*83;tx=160+math.sin(u*2.4+j*1.7)*143
   poly(overlay,[(sx-3,19),(sx+3,19),(tx+28,H),(tx-28,H)],(67,178,100))
  im=cv2.addWeighted(overlay,.33,im,.67,0)
 elif t<20:
  u=t-15;z=.48+u*.43;x=160+math.sin(u*1.1)*14;y=76
  def p(pts):return [(x+a*z,y+b*z) for a,b in pts]
  poly(im,p([(-77,59),(-77,-30),(-48,-75),(48,-75),(77,-30),(77,59)]),(46,113,65))
  poly(im,p([(-86,-21),(0,-113),(86,-21)]),(88,178,113))
  poly(im,p([(-26,59),(-26,4),(0,-36),(26,4),(26,59)]),(0,8,2))
  for xx in (-57,57):
   poly(im,p([(xx-11,59),(xx-11,-27),(xx+11,-27),(xx+11,59)]),(105,188,116))
   skull(im,x+xx*z,y-43*z,z*.8)
  for i in range(7):
   a=i*math.pi/3.5
   line(im,p([(0,-63)])[0],p([(math.cos(a)*17,-63+math.sin(a)*17)])[0])
  for i in range(7):line(im,p([(-45-i*3,64+i*7)])[0],p([(45+i*3,64+i*7)])[0])
 else:
  u=t-20
  for i in range(8,0,-1):
   d=(i/8+u*.66)%1;r=14+d*173;cx=160+math.sin(u*2+d*4)*17;cy=78
   pts=[(cx-r,H),(cx-r,cy-r*.66),(cx-r*.6,cy-r),(cx+r*.6,cy-r),(cx+r,cy-r*.66),(cx+r,H)]
   for j in range(len(pts)-1):line(im,pts[j],pts[j+1],(int(20+d*60),int(45+d*145),int(29+d*77)),max(1,int(1+d*3)))
  skull(im,160,83,1.8)
 v=np.clip(1-((X-160)/215)**2-((Y-66)/93)**2,.15,1)
 return (im*v[:,:,None]).astype('uint8')
os.makedirs('assets',exist_ok=True)
cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','7','-b:v','350k','-pix_fmt','yuv420p','assets/hellxbone-cemetery.webm']
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
for i in range(FPS*N):p.stdin.write(frame(i/FPS).tobytes())
p.stdin.close()
if p.wait():raise SystemExit(1)

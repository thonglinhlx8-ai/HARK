# ep54 hiệu ứng âm thanh tổng hợp bằng code: shot, flak, thud, clank, whistle, debris, riser, tick2, pop
import numpy as np, wave, os
SR=48000; D='public/audio/ep54-song-sot/sfx'; os.makedirs(D,exist_ok=True)
rng=np.random.default_rng(54)
def t(d): return np.arange(int(d*SR))/SR
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0.
    for i,v in enumerate(x): s=(1-a)*v+a*s; y[i]=s
    return y
def hp(x,fc): return x-lp(x,fc)
def save(n,x,g=0.9):
    x=x/ (np.abs(x).max()+1e-9)*g
    s=np.repeat((x*32767).astype(np.int16)[:,None],2,1)
    w=wave.open(f'{D}/{n}.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(s.tobytes()); w.close()
def rev(x,mix=0.3,dec=0.6):
    y=x.copy()
    for k,dl in enumerate([0.031,0.047,0.071,0.097,0.13]):
        n=int(dl*SR); y[n:]+=x[:-n]*mix*dec**k
    return y
# shot: crack + low thump
tt=t(0.5); n=rng.standard_normal(len(tt))
shot=hp(n,1500)*np.exp(-tt*60)*1.0+np.sin(2*np.pi*(110*tt-60*tt*tt))*np.exp(-tt*18)*0.9
save('shot',rev(shot,0.25),0.8)
# flak: distant boom with crackle tail
tt=t(1.6); n=rng.standard_normal(len(tt))
flak=lp(n,400)*np.exp(-tt*4)*1.4+np.sin(2*np.pi*(60*tt-12*tt*tt))*np.exp(-tt*5)
cr=np.zeros(len(tt))
for k in range(40):
    p=int(rng.uniform(0.05,1.2)*SR); L=int(0.004*SR); cr[p:p+L]+=rng.standard_normal(L)*np.exp(-p/SR*2.5)
flak+=hp(cr,2000)*0.6
save('flak',rev(flak,0.35),0.75)
# thud: heavy slam
tt=t(0.9); n=rng.standard_normal(len(tt))
thud=np.sin(2*np.pi*(75*tt-35*tt*tt))*np.exp(-tt*7)*1.2+lp(n,900)*np.exp(-tt*25)*0.9
save('thud',rev(thud,0.2),0.95)
# clank: metal plate slam
tt=t(1.2); n=rng.standard_normal(len(tt))
cl=sum(np.sin(2*np.pi*f*tt+rng.uniform(0,6))*np.exp(-tt*d)*a for f,d,a in [(310,9,0.6),(733,11,0.5),(1187,14,0.4),(1931,18,0.3),(2711,22,0.2)])
cl+=lp(n,1500)*np.exp(-tt*40)*1.0+np.sin(2*np.pi*(90*tt-40*tt*tt))*np.exp(-tt*10)*0.9
save('clank',rev(cl,0.3),0.9)
# whistle: falling bomb/plane descending tone
tt=t(1.4); f=1500*np.exp(-tt*1.1)+250
ph=2*np.pi*np.cumsum(f)/SR; wh=np.sin(ph)*np.minimum(1,tt*6)*np.exp(-tt*0.8)*0.6+hp(rng.standard_normal(len(tt)),3000)*0.05*np.minimum(1,tt*4)
save('whistle',wh,0.5)
# debris: brick rubble collapse
tt=t(1.3); deb=np.zeros(len(tt))
for k in range(26):
    p=int((rng.uniform(0,0.9)**1.5)*SR); L=int(0.06*SR); s=np.arange(L)/SR
    deb[p:p+L]+=(lp(rng.standard_normal(L),rng.uniform(600,2500))*np.exp(-s*rng.uniform(40,90)))[:len(deb)-p]*rng.uniform(0.3,1)
deb+=np.sin(2*np.pi*(65*tt-25*tt*tt))*np.exp(-tt*6)*0.8
save('debris',rev(deb,0.3),0.85)
# riser
tt=t(1.4); n=rng.standard_normal(len(tt)); env=(tt/1.4)**2
r=np.zeros(len(tt)); fc=300
seg=int(0.05*SR)
for i in range(0,len(tt),seg):
    r[i:i+seg]=lp(n[i:i+seg],300+5000*(i/len(tt))**2)
save('riser',r*env+np.sin(2*np.pi*np.cumsum(200+600*(tt/1.4)**2)/SR)*env*0.3,0.6)
# tick2: crisp UI tick
tt=t(0.08); save('tick',np.sin(2*np.pi*2400*tt)*np.exp(-tt*90)+hp(rng.standard_normal(len(tt)),4000)*np.exp(-tt*200)*0.4,0.5)
# pop: soft appear
tt=t(0.25); save('pop',np.sin(2*np.pi*(900*tt-1400*tt*tt))*np.exp(-tt*22),0.5)
print(sorted(os.listdir(D)))

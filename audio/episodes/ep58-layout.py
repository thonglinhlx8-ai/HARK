# ep58 (bản KHÔNG lời dẫn, 2026-10-21): chỉ chữ + nhạc user gửi.
# Lưới = phách thật của nhạc (beats.json, ~112 BPM, 1 ô nhịp = 4 phách ≈ 2,13 s).
# Thời lượng mỗi câu theo tốc độ đọc: chữ hiện từng từ (WSTEP s/từ), giữ đủ để đọc (READ s/từ + HOLD).
# Mọi câu bắt đầu đúng 1 phách; câu mở cảnh đúng nửa ô nhịp; từ khóa (lo âu, 91,4%, chạy, câu 19) đúng vạch ô nhịp.
import json,re
cues=json.load(open('src/episodes/ep58-su-tu/cues.json'))
B=json.load(open('src/episodes/ep58-su-tu/beats.orig.json')); BO=list(B)
BASS=json.load(open('src/episodes/ep58-su-tu/bass.orig.json')); splice=None; bar=lambda k:B[4*k]
nb=lambda t,step:min(i for i in range(0,len(B),step) if B[i]>=t-1e-6)
WSTEP,READ,HOLD,MIN=0.13,0.19,0.5,1.9  # siết 2026-10-21: user muốn gần độ dài bản gốc (~1p40)
SCENE={4,7,9,10,12,14,20,24}
HIT={3:'lo âu',13:'91,4%',15:'chạy',19:None}
# drop thật của nhạc (dò dải bass <150 Hz, 2026-10-21): drop 1 = ô 8 (17,5 s), breakdown ô 36–43, drop 2 = ô 44 (93,9 s)
MINBAR={3:8,19:44}
GAP={1:0.3,5:0.3,11:0.3,21:0.3,22:0.3,23:0.3}
t=B[2]; out=[]; hits=[]
for i,c in enumerate(cues):
    disp=re.sub(r'[【】]','',c); toks=disp.split(' ')
    ws=[round(j*WSTEP,3) for j in range(len(toks))]
    times=[]
    for j,tok in enumerate(toks): times+=[ws[j]]*len(tok)+([ws[j]] if j<len(toks)-1 else [])
    assert len(times)==len(disp)
    if i in HIT:
        off=times[disp.lower().index(HIT[i])] if HIT[i] else 0
        k=nb(t+off,4)//4
        if i==19 and k<44 and k-8>=12:
            # cắt nhạc: bỏ đoạn [ô k-8, ô 36) để breakdown (36–43) + drop 2 (44) rơi đúng ô k
            A,C=bar(k-8),bar(36); D=C-A; splice=[A,C]
            B=[b for b in BO if b<A-1e-3]+[round(b-D,3) for b in BO if b>=C-1e-3]
            BASS=[x for x in BASS if x[0]<A-1e-3]+[[round(x[0]-D,3),x[1]] for x in BASS if x[0]>=C-1e-3]
            MINBAR[19]=k
        if i in MINBAR and k!=MINBAR[i]:
            k=MINBAR[i]  # ép đúng drop; câu trước bị cắt bớt phần giữ nếu cần
            if out and bar(k)-off<out[-1]['end']+1.2: out[-1]['end']=round(bar(k)-off-1.5,3)
        t=bar(k)-off; hits.append(k)
    elif i in SCENE: t=B[nb(t,1)]
    else: t=B[nb(t,1)]
    dur=max(MIN,len(toks)*READ+HOLD)
    out.append({'start':round(t,3),'end':round(t+dur-1.2,3),'times':times})
    t+=dur+GAP.get(i+1,0.2)
bars=nb(t+2.5,4)//4
json.dump(out,open('src/episodes/ep58-su-tu/vo.json','w'),ensure_ascii=False)
json.dump(B,open('src/episodes/ep58-su-tu/beats.json','w')); json.dump(BASS,open('src/episodes/ep58-su-tu/bass.json','w'))
json.dump({'end':round(bar(bars)+0.5,2),'bars':bars,'hits':hits,'splice':splice},open('src/episodes/ep58-su-tu/layout.json','w'))
print('hits',hits,'bars',bars,'end',round(bar(bars)+0.5,1))
for i,o in enumerate(out): print(i,o['start'],round(o['end']+1.2-o['start'],1))

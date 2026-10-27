# ep56 lồng tiếng: Edge TTS vi-VN-NamMinhNeural +6%; ghi vo/NN.mp3 + meta.json (thời lượng, word boundaries)
import re,asyncio,edge_tts,subprocess,json
cues=json.load(open('src/episodes/ep57-chi-phi-chim/cues.json'))
D='public/audio/ep57-chi-phi-chim/vo'
def tts(t): return re.sub(r'[【】"]','',t).replace(' – ',', ').replace(' —','').strip()
async def one(i,t):
    p=f'{D}/{i:02d}.mp3'; words=[]
    c=edge_tts.Communicate(tts(t),'vi-VN-NamMinhNeural',rate='+6%',boundary='WordBoundary')
    with open(p,'wb') as fh:
        async for m in c.stream():
            if m['type']=='audio': fh.write(m['data'])
            elif m['type']=='WordBoundary': words.append([m['offset']/1e7,(m['offset']+m['duration'])/1e7,m['text']])
    d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]))
    return {'i':i,'dur':d,'words':words,'tts':tts(t)}
async def go(): return [await one(i,t) for i,t in enumerate(cues)]
r=asyncio.run(go()); json.dump(r,open(f'{D}/meta.json','w'),ensure_ascii=False,indent=1)
for x in r: print(x['i'],round(x['dur'],2),len(x['words']),len(x['tts'].split()),x['tts'])

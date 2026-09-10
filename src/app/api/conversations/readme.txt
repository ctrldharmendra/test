1:

Kab chalta hai: jab user "Messages" tab khole

Kya karta hai: sab conversations jisme logged-in user participant hai, har ek ka last message + doosre participant ki info + unread count

2:
POST /api/conversations — naya chat start karna

Kab chalta hai: jab user kisi profile pe "Message" button dabaye

Kya karta hai:

Check karo — kya in do users (logged-in + target) ka already ek conversation exist karta hai?
Agar haan → wahi conversation_id return karo
Agar nahi → naya conversations row banao + conversation_participants me dono users insert karo (transaction me, jaisa aapne register route me kiya tha users + user_locations ke liye)
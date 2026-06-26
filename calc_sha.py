import hashlib, base64, struct, sys

filepath = sys.argv[1]
with open(filepath, 'rb') as f:
    data = f.read()

file_size = len(data)
BLOCK_SIZE = 524288
full_sha = hashlib.sha1(data).hexdigest()
print(f'FILE_SIZE={file_size}')
print(f'FILE_SHA={full_sha}')
print(f'FILE_MD5={hashlib.md5(data).hexdigest()}')

lastBlockSize = file_size % BLOCK_SIZE
if lastBlockSize == 0:
    lastBlockSize = BLOCK_SIZE
checkBlockSize = lastBlockSize % 128
if checkBlockSize == 0:
    checkBlockSize = 128

prefix_len = file_size - checkBlockSize

def sha1_state(input_data):
    h0, h1, h2, h3, h4 = 0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0
    original_byte_len = len(input_data)
    original_bit_len = original_byte_len * 8
    msg = input_data + b'\x80'
    while (len(msg) * 8) % 512 != 448:
        msg += b'\x00'
    msg += struct.pack('>Q', original_bit_len)
    for i in range(0, len(msg), 64):
        chunk = msg[i:i+64]
        w = list(struct.unpack('>16I', chunk))
        for j in range(16, 80):
            val = w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16]
            w.append(((val << 1) | (val >> 31)) & 0xFFFFFFFF)
        a, b, c, d, e = h0, h1, h2, h3, h4
        for j in range(80):
            if j < 20:
                f = (b & c) | ((~b) & d); k = 0x5A827999
            elif j < 40:
                f = b ^ c ^ d; k = 0x6ED9EBA1
            elif j < 60:
                f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC
            else:
                f = b ^ c ^ d; k = 0xCA62C1D6
            temp = (((a << 5) | (a >> 27)) + f + e + k + w[j]) & 0xFFFFFFFF
            e, d, c, b, a = d, c, ((b << 30) | (b >> 2)) & 0xFFFFFFFF, a, temp
        h0 = (h0 + a) & 0xFFFFFFFF
        h1 = (h1 + b) & 0xFFFFFFFF
        h2 = (h2 + c) & 0xFFFFFFFF
        h3 = (h3 + d) & 0xFFFFFFFF
        h4 = (h4 + e) & 0xFFFFFFFF
    return h0, h1, h2, h3, h4

prefix_data = data[:prefix_len]
h = sha1_state(prefix_data)
check_sha = ''.join(struct.pack('<I', v).hex() for v in h)
print(f'CHECK_SHA={check_sha}')

check_data_b64 = base64.b64encode(data[prefix_len:]).decode()
print(f'CHECK_DATA={check_data_b64}')

# Verify
v = sha1_state(data)
verify_sha = struct.pack('>IIIII', *v).hex()
print(f'VERIFY={verify_sha}')
print(f'MATCH={verify_sha == full_sha}')

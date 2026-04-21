package iuh.fit.goat.component.agora.token;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;

class ByteBuf {
    ByteBuffer buffer = ByteBuffer.allocate(1024).order(ByteOrder.LITTLE_ENDIAN);

    ByteBuf() {
    }

    ByteBuf(byte[] bytes) {
        this.buffer = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN);
    }

    byte[] asBytes() {
        byte[] out = new byte[buffer.position()];
        buffer.rewind();
        buffer.get(out, 0, out.length);
        return out;
    }

    ByteBuf put(short value) {
        buffer.putShort(value);
        return this;
    }

    ByteBuf put(byte[] value) {
        put((short) value.length);
        buffer.put(value);
        return this;
    }

    ByteBuf put(int value) {
        buffer.putInt(value);
        return this;
    }

    ByteBuf put(String value) {
        return put(value.getBytes(StandardCharsets.UTF_8));
    }

    ByteBuf putIntMap(TreeMap<Short, Integer> extra) {
        put((short) extra.size());
        for (Map.Entry<Short, Integer> pair : extra.entrySet()) {
            put(pair.getKey());
            put(pair.getValue());
        }
        return this;
    }

    short readShort() {
        return buffer.getShort();
    }

    int readInt() {
        return buffer.getInt();
    }

    byte[] readBytes() {
        short length = readShort();
        byte[] bytes = new byte[length];
        buffer.get(bytes);
        return bytes;
    }

    String readString() {
        return new String(readBytes(), StandardCharsets.UTF_8);
    }

    TreeMap<Short, Integer> readIntMap() {
        TreeMap<Short, Integer> map = new TreeMap<>();
        short length = readShort();

        for (short i = 0; i < length; ++i) {
            short key = readShort();
            Integer value = readInt();
            map.put(key, value);
        }

        return map;
    }
}

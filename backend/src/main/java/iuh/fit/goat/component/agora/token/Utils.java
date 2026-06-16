package iuh.fit.goat.component.agora.token;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Date;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

class Utils {
    static final int VERSION_LENGTH = 3;

    private Utils() {
    }

    static String base64Encode(byte[] data) {
        return Base64.getEncoder().encodeToString(data);
    }

    static byte[] base64Decode(String data) {
        return Base64.getDecoder().decode(data);
    }

    static int getTimestamp() {
        return (int) ((new Date().getTime()) / 1000);
    }

    static int randomInt() {
        return new java.security.SecureRandom().nextInt();
    }

    static boolean isUUID(String uuid) {
        if (uuid == null || uuid.length() != 32) {
            return false;
        }

        return uuid.matches("\\p{XDigit}+");
    }

    static byte[] compress(byte[] data) {
        byte[] output;
        Deflater deflater = new Deflater();
        ByteArrayOutputStream bos = new ByteArrayOutputStream(data.length);

        try {
            deflater.reset();
            deflater.setInput(data);
            deflater.finish();

            byte[] buffer = new byte[data.length];
            while (!deflater.finished()) {
                int count = deflater.deflate(buffer);
                bos.write(buffer, 0, count);
            }
            output = bos.toByteArray();
        } catch (Exception e) {
            output = data;
        } finally {
            deflater.end();
        }

        return output;
    }

    static byte[] decompress(byte[] data) {
        Inflater inflater = new Inflater();
        ByteArrayOutputStream bos = new ByteArrayOutputStream(data.length);

        try {
            inflater.setInput(data);
            byte[] buffer = new byte[8192];
            int len;

            while ((len = inflater.inflate(buffer)) > 0) {
                bos.write(buffer, 0, len);
            }
        } catch (Exception ignored) {
        } finally {
            inflater.end();
        }

        return bos.toByteArray();
    }
}

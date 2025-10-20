#include <emscripten/emscripten.h>
#include <string>
#include <random>
#include <cstring>
#include <cstdlib>
#include <algorithm>

extern "C"
{

    EMSCRIPTEN_KEEPALIVE
    char *generate_password(int length, int use_upper, int use_lower, int use_digits, int use_symbols)
    {
        if (length <= 0)
            length = 1;

        std::string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        std::string lower = "abcdefghijklmnopqrstuvwxyz";
        std::string digits = "0123456789";
        std::string symbols = "!@#$%^&*()-_=+[]{};:,.<>?/";

        std::string pool;
        std::string guaranteed;

        std::random_device rd;
        std::mt19937 gen(rd());

        auto pick_one = [&](const std::string &src)
        {
            std::uniform_int_distribution<> d(0, static_cast<int>(src.size()) - 1);
            return src[d(gen)];
        };

        int selected = 0;
        if (use_upper)
            selected++;
        if (use_lower)
            selected++;
        if (use_digits)
            selected++;
        if (use_symbols)
            selected++;

        if (selected == 0)
        {
            pool = lower + upper + digits;
            guaranteed += pick_one(lower);
            selected = 1;
        }
        else
        {
            if (use_upper)
            {
                pool += upper;
                guaranteed += pick_one(upper);
            }
            if (use_lower)
            {
                pool += lower;
                guaranteed += pick_one(lower);
            }
            if (use_digits)
            {
                pool += digits;
                guaranteed += pick_one(digits);
            }
            if (use_symbols)
            {
                pool += symbols;
                guaranteed += pick_one(symbols);
            }
        }

        // Проверка: длина не меньше числа выбранных типов
        if (length < selected)
        {
            const char *msg = "ERROR_TOO_SHORT";
            char *err = (char *)malloc(strlen(msg) + 1);
            strcpy(err, msg);
            return err;
        }

        std::string password = guaranteed;
        std::uniform_int_distribution<> dist(0, static_cast<int>(pool.size()) - 1);

        while ((int)password.size() < length)
        {
            password += pool[dist(gen)];
        }

        std::shuffle(password.begin(), password.end(), gen);

        char *result = (char *)malloc(password.size() + 1);
        std::memcpy(result, password.c_str(), password.size() + 1);
        return result;
    }

    EMSCRIPTEN_KEEPALIVE
    void free_str(char *p)
    {
        if (p)
            free(p);
    }

} 

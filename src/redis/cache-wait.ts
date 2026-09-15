const sleep = async (ms: number) => {
  await new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
};

export const waitForCache = async (
  getCache: () => Promise<string | null>,
) => {
  const delays = [
    50,
    100,
    200,
    400,
  ];

  for (const delay of delays) {
    await sleep(delay);

    const cachedValue = await getCache();

    if (cachedValue) {
      return cachedValue;
    }
  }

  return null;
};